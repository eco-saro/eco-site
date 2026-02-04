import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Order } from "@/models/order.model";
import { Payout } from "@/models/payout.model";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const { orderItems, transactionReference, payoutDate } = await req.json();

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return NextResponse.json({ message: "No items selected" }, { status: 400 });
        }

        const results = [];

        for (const item of orderItems) {
            const { orderId, productName } = item;

            // Update the specific product in the order
            const updatedOrder = await Order.findOneAndUpdate(
                {
                    _id: orderId,
                    "products.name": productName,
                    "products.payoutStatus": { $ne: "COMPLETED" }
                },
                {
                    $set: {
                        "products.$.payoutStatus": "COMPLETED",
                        "products.$.payoutDate": payoutDate || new Date(),
                        "products.$.payoutReference": transactionReference,
                        "products.$.isLocked": true
                    }
                },
                { new: true }
            );

            if (updatedOrder) {
                const product = updatedOrder.products.find((p: any) => p.name === productName);

                // Record in Payout model for audit trail
                await Payout.create({
                    order: orderId,
                    vendor: product.vendor,
                    amount: product.netAmount,
                    platformFee: product.commissionAmount,
                    payoutStatus: "COMPLETED",
                    processedAt: payoutDate || new Date(),
                    razorpayPayoutId: transactionReference // Using ref as payout ID
                });

                results.push({ orderId, status: "success" });
            } else {
                results.push({ orderId, status: "failed", reason: "Item already paid or not found" });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${results.filter(r => r.status === "success").length} items`,
            details: results
        });

    } catch (error: any) {
        console.error("Mark Paid API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
