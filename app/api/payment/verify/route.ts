import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import db from "@/lib/mongodb"
import { Order } from "@/models/order.model"
import { Product } from "@/models/product.model"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
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
