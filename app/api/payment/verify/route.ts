import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import db from "@/lib/mongodb"
import { Order } from "@/models/order.model"
import { Product } from "@/models/product.model"
import { Settings } from "@/models/settings.model"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { shiprocket } from "@/lib/shiprocket"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            shippingAddress
        } = await req.json()

        // 1. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex")

        const isAuthentic = expectedSignature === razorpay_signature

        if (!isAuthentic) {
            return NextResponse.json({
                message: "Payment verification failed",
                success: false
            }, { status: 400 })
        }

        // 2. Create Order in Database
        await db()

        // 2.1 Get Commission Rate
        const settings = await Settings.findOne();
        const commissionRate = settings?.commissionRate ?? 10;

        // 2a. Initial Stock Validation & Price Calculation
        let calculatedTotalAmount = 0;
        const productsData = [];

        for (const item of items) {
            const id = item.id || item.productId;
            const product = await Product.findById(id);
            if (!product) {
                return NextResponse.json({ message: `Product ${item.name} not found` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });
            }

            calculatedTotalAmount += product.price * item.quantity;
            productsData.push({
                product: id,
                vendor: product.vendor,
                name: product.name,
                price: product.price, // Use DB price
                quantity: item.quantity,
                image: product.images[0] || item.image
            });
        }

        // 2b. Process Items and Atomic Stock Decrement
        const processedItems = await Promise.all(productsData.map(async (data: any) => {
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: data.product, stock: { $gte: data.quantity } },
                { $inc: { stock: -data.quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                throw new Error(`Insufficient stock for ${data.name} (concurrent purchase)`);
            }

            const itemTotal = data.price * data.quantity;
            const commissionAmount = Math.round(itemTotal * (commissionRate / 100));
            const netAmount = itemTotal - commissionAmount;

            return {
                product: data.product,
                vendor: data.vendor,
                name: data.name,
                quantity: data.quantity,
                price: data.price,
                image: data.image,
                commissionAmount,
                netAmount,
                payoutStatus: 'PENDING',
                isLocked: false
            }
        }));

        const newOrder = await Order.create({
            user: (session.user as any).id,
            products: processedItems,
            totalAmount: calculatedTotalAmount, // Use calculated total
            status: 'completed',
            paymentMethod: 'Card',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            shippingAddress: shippingAddress || {
                name: session.user.name,
                phone: 'Not Provided',
                street: 'Not Provided',
                city: 'Not Provided',
                state: 'Not Provided',
                pincode: '000000',
                country: 'India'
            }
        })

        // 3. Create Order in Shiprocket
        try {
            console.log(`[Payment] 🔄 Initiating Shiprocket sync for order ${newOrder._id}`);

            const shiprocketOrder = await shiprocket.createOrder({
                order_id: newOrder._id.toString(),
                order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                billing_customer_name: shippingAddress?.name?.split(' ')[0] || session.user.name?.split(' ')[0] || "Customer",
                billing_last_name: shippingAddress?.name?.split(' ').slice(1).join(' ') || "User",
                billing_address: shippingAddress?.street || "Not Provided",
                billing_city: shippingAddress?.city || "Not Provided",
                billing_pincode: shippingAddress?.pincode || "000000",
                billing_state: shippingAddress?.state || "Not Provided",
                billing_country: shippingAddress?.country || "India",
                billing_email: session.user.email || "no-email@provided.com",
                billing_phone: shippingAddress?.phone || "0000000000",
                shipping_is_billing: true,
                order_items: processedItems.map((item: any) => ({
                    name: item.name,
                    sku: item.product.toString(),
                    units: item.quantity,
                    selling_price: item.price
                })),
                payment_method: "Prepaid",
                sub_total: calculatedTotalAmount,
                length: 10,
                breadth: 10,
                height: 10,
                weight: 0.5
            });

            if (shiprocketOrder?.order_id) {
                console.log(`[Payment] ✅ Shiprocket order synchronized successfully. SR_ID: ${shiprocketOrder.order_id}`);
                await Order.findByIdAndUpdate(newOrder._id, {
                    shiprocketOrderId: shiprocketOrder.order_id,
                    shiprocketShipmentId: shiprocketOrder.shipment_id,
                    shippingStatus: "Processing"
                });
            }
        } catch (srError: any) {
            console.error("[Payment] ⚠️ Shiprocket Sync Failed (Non-blocking):", srError.message || srError);
            // Non-blocking: We've already confirmed payment and saved the order in our DB
        }

        return NextResponse.json({
            message: "Payment verified and order created",
            success: true,
            orderId: newOrder._id
        }, { status: 200 })

    } catch (error) {
        console.error("Verification/Order creation error:", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}
