import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Payout } from "@/models/payout.model";
import { Vendor } from "@/models/vendor";
import { Order } from "@/models/order.model";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== "vendor") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const userId = (session.user as any).id;
        const vendor = await Vendor.findOne({ user: userId });

        if (!vendor) {
            return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
        }

        // 1. Fetch Payout History
        const payoutHistory = await Payout.find({ vendor: vendor._id })
            .sort({ createdAt: -1 })
            .limit(50);

        // 2. Fetch Orders related to this vendor to calculate sales and pending
        const orders = await Order.find({
            "products.vendor": vendor._id,
            status: { $ne: "Cancelled" }
        }).sort({ createdAt: -1 });

        // 3. Calculate Metrics
        let totalEarnings = 0;
        let pendingPayouts = 0;
        let refundsTotal = 0;
        const sales = [];

        for (const order of orders) {
            const vendorProducts = order.products.filter(
                (p: any) => p.vendor.toString() === vendor._id.toString()
            );

            for (const product of vendorProducts) {
                const itemTotal = product.price * product.quantity;
                const platformFee = Math.round(itemTotal * 0.1); // Assuming 10%
                const vendorShare = itemTotal - platformFee;

                if (product.payoutStatus === "COMPLETED") {
                    totalEarnings += vendorShare;
                } else if (product.payoutStatus === "PENDING" || product.payoutStatus === "BLOCKED") {
                    pendingPayouts += vendorShare;
                }

                if (product.refunded) {
                    refundsTotal += vendorShare;
                }

                // Add to sales log with unique ID per product line item
                sales.push({
                    id: `${order._id.toString().slice(-8)}-${product.product.toString().slice(-4)}`.toUpperCase(),
                    date: order.createdAt,
                    amount: vendorShare,
                    type: "sale",
                    status: product.payoutStatus?.toLowerCase() || "pending",
                    reference: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
                    isRefunded: product.refunded
                });
            }
        }

        const availableBalance = vendor.isBankVerified ? 0 : 0; // This logic depends on Razorpay account balance, but for now we show 0 or calculate from Payout model

        // Merge Payout History into transactions
        const transactions = [
            ...sales.map(s => ({ ...s, id: `S-${s.id}` })),
            ...payoutHistory.map(p => ({
                id: `P-${p._id.toString().slice(-8).toUpperCase()}`,
                date: p.createdAt,
                amount: -p.amount,
                type: "payout",
                status: p.payoutStatus.toLowerCase(),
                reference: p.razorpayTransferId ? `Transfer: ${p.razorpayTransferId}` : "Scheduled Payout"
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            success: true,
            metrics: {
                totalEarnings,
                pendingPayouts,
                refundsTotal,
                availableBalance,
                processingFees: totalEarnings * 0.11, // Rough estimate incl GST
            },
            transactions,
            vendor: {
                isBankVerified: vendor.isBankVerified,
                hasBankDetails: !!(vendor.payoutDetails?.accountNumber),
                payoutBlockReason: vendor.payoutDetails ? null : "BANK_DETAILS_MISSING"
            }
        });

    } catch (error: any) {
        console.error("Error fetching payment data:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
