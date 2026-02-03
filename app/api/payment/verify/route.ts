import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import db from "@/lib/mongodb"
import { Order } from "@/models/order.model"
import { Product } from "@/models/product.model"
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
            totalAmount,
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

        // Map items to include vendor info if not present
        // Frontend should ideally send vendor info, but if not, we fetch it
        const processedItems = await Promise.all(items.map(async (item: any) => {
            if (item.vendor) return item;

            const product = await Product.findById(item.id || item.productId);
            return {
                product: item.id || item.productId,
                vendor: product?.vendor,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            }
        }));

        const newOrder = await Order.create({
            user: (session.user as any).id,
            products: processedItems,
            totalAmount,
            status: 'completed', // Since payment is verified
            paymentMethod: 'Card', // Assumption for Razorpay
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
                sub_total: totalAmount,
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
