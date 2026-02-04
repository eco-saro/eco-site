import Razorpay from "razorpay";
import db from "./mongodb";
import { Order } from "../models/order.model";
import { Vendor } from "../models/vendor";
import { Payout } from "../models/payout.model";
import { Settings } from "../models/settings.model";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const COMMISSION_PERCENTAGE_DEFAULT = 10; // Default 10% Platform Fee
const RETURN_WINDOW_DAYS = 7; // Payout after 7 days of delivery

export class PayoutService {
    /**
     * Gets the current platform commission rate
     */
    private static async getCommissionRate() {
        try {
            const settings = await Settings.findOne();
            return settings?.commissionRate ?? COMMISSION_PERCENTAGE_DEFAULT;
        } catch (error) {
            return COMMISSION_PERCENTAGE_DEFAULT;
        }
    }
    /**
     * Main entry point to process payouts for an order.
     * Usually called via Cron or Order Status Update.
     */
    static async processOrderPayouts(orderId: string) {
        await db();
        const order = await Order.findById(orderId).populate("products.vendor");

        if (!order) throw new Error("Order not found");

        // Rule 1: Only check Delivered orders
        if (order.status !== "Delivered" && order.status !== "completed") {
            console.log(`[Payout] Order ${orderId} is not delivered yet. Current status: ${order.status}`);
            return;
        }

        // Rule 1.1: Verify Return Window
        const deliveryDate = new Date(order.updatedAt);
        const now = new Date();
        const daysSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceDelivery < RETURN_WINDOW_DAYS) {
            console.log(`[Payout] Order ${orderId} is within return window (${daysSinceDelivery}/${RETURN_WINDOW_DAYS} days)`);
            return;
        }

        for (let i = 0; i < order.products.length; i++) {
            const product = order.products[i];
            if (product.payoutStatus === "COMPLETED" || product.refunded) continue;

            await this.handleVendorPayout(order, i);
        }
    }

    /**
     * Handles payout for a specific vendor's item in an order
     */
    private static async handleVendorPayout(order: any, itemIndex: number) {
        const product = order.products[itemIndex];
        const vendorId = product.vendor._id || product.vendor;
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) return;

        // Rule 2: Validate Bank Details
        const validation = this.validateBankDetails(vendor);
        if (!validation.isValid) {
            console.log(`[Payout] 🛑 Blocking payout for Vendor ${vendor.businessName}: ${validation.reason}`);

            // Update Order status to BLOCKED if not already
            await Order.updateOne(
                { _id: order._id, "products._id": product._id },
                {
                    $set: {
                        "products.$.payoutStatus": "BLOCKED",
                        "products.$.payoutBlockReason": validation.reason
                    }
                }
            );
            return;
        }

        try {
            // Calculate Amounts
            const commissionRate = await this.getCommissionRate();
            const itemTotal = product.price * product.quantity;
            const platformFee = Math.round(itemTotal * (commissionRate / 100));
            const vendorAmount = itemTotal - platformFee;

            console.log(`[Payout] 💸 Initiating transfer for Order ${order._id}, Item ${product.name}`);
            console.log(`[Payout] Total: ₹${itemTotal}, Fee: ₹${platformFee}, Vendor Share: ₹${vendorAmount}`);

            // Ensure Vendor has a Linked Account in Razorpay (Route)
            let accountId = vendor.razorpayAccountId;
            if (!accountId) {
                accountId = await this.createLinkedAccount(vendor);
                vendor.razorpayAccountId = accountId;
                await vendor.save();
            }

            // Trigger Razorpay Transfer
            // Marketplace logic: Move money from platform account to vendor account
            const transfer: any = await razorpay.transfers.create({
                account: accountId,
                amount: vendorAmount * 100, // Convert to paise
                currency: "INR",
                notes: {
                    order_id: order._id.toString(),
                    product_id: product.product.toString()
                }
            });

            // Mark as COMPLETED
            await Order.updateOne(
                { _id: order._id, "products._id": product._id },
                {
                    $set: {
                        "products.$.payoutStatus": "COMPLETED",
                        "products.$.razorpayTransferId": transfer.id,
                        "products.$.payoutBlockReason": null
                    }
                }
            );

            // Record in Payout History
            await Payout.create({
                order: order._id,
                vendor: vendor._id,
                amount: vendorAmount,
                platformFee: platformFee,
                payoutStatus: "COMPLETED",
                razorpayTransferId: transfer.id
            });

            console.log(`[Payout] ✅ Success! Transfer ID: ${transfer.id}`);

        } catch (error: any) {
            console.error(`[Payout] ❌ Failed to process payout for vendor ${vendor.businessName}:`, error.message);

            await Order.updateOne(
                { _id: order._id, "products._id": product._id },
                { $set: { "products.$.payoutStatus": "FAILED" } }
            );

            await Payout.create({
                order: order._id,
                vendor: vendor._id,
                amount: 0,
                platformFee: 0,
                payoutStatus: "FAILED",
                blockReason: error.message
            });
        }
    }

    private static validateBankDetails(vendor: any) {
        const details = vendor.payoutDetails;
        if (!details?.accountNumber || !details?.ifscCode || !details?.accountHolder) {
            return { isValid: false, reason: "BANK_DETAILS_MISSING" };
        }

        // Strict validation for IFSC (simple regex)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(details.ifscCode)) {
            return { isValid: false, reason: "INVALID_IFSC_CODE" };
        }

        if (!vendor.isBankVerified) {
            return { isValid: false, reason: "BANK_DETAILS_UNVERIFIED" };
        }

        return { isValid: true };
    }

    /**
     * Creates a Linked Account on Razorpay (Standard approach for India Marketplace)
     */
    private static async createLinkedAccount(vendor: any) {
        try {
            const payload: any = {
                type: "route",
                email: vendor.businessEmail,
                profile: {
                    name: vendor.accountHolder || vendor.businessName,
                    category: "ecommerce",
                    addresses: {
                        registered: {
                            street1: vendor.businessAddress.street,
                            street2: "",
                            city: vendor.businessAddress.city,
                            state: vendor.businessAddress.state,
                            postal_code: vendor.businessAddress.pincode,
                            country: "IN"
                        }
                    }
                },
                legal_business_name: vendor.businessName,
                business_type: "individual",
                contact_name: vendor.accountHolder || vendor.businessName
            };

            const account: any = await razorpay.accounts.create(payload);
            return account.id;
        } catch (error: any) {
            throw new Error(`Razorpay Account Creation Failed: ${error.message}`);
        }
    }
}
