import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/mongodb";
import { Order } from "@/models/order.model";
import { PayoutService } from "@/lib/payout-service";

/**
 * Weekly/Daily Cron to process pending payouts
 * Can be triggered via /api/admin/payouts/automate
 * Ensure to protect this with a secret or admin session
 */
export async function GET(req: NextRequest) {
    // Use a strict CRON_SECRET for automated triggers, or check for admin session
    const authHeader = req.headers.get('authorization');
    const isSecretValid = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isSecretValid) {
        // Fallback: Check if it's an admin user manually triggering
        const { getServerSession } = await import("next-auth/next");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
    }

    await db();

    try {
        // Find all orders that are Delivered OR completed
        // and have at least one product with payoutStatus: PENDING or BLOCKED
        const candidateOrders = await Order.find({
            status: { $in: ["Delivered", "completed"] },
            "products.payoutStatus": { $in: ["PENDING", "BLOCKED"] }
        }).select("_id");

        console.log(`[Automation] 🤖 Found ${candidateOrders.length} orders eligible for payout check.`);

        const results = [];
        for (const order of candidateOrders) {
            try {
                await PayoutService.processOrderPayouts(order._id.toString());
                results.push({ orderId: order._id, status: "success" });
            } catch (err: any) {
                results.push({ orderId: order._id, status: "error", message: err.message });
            }
        }

        return NextResponse.json({
            processedCount: candidateOrders.length,
            details: results
        });

    } catch (error: any) {
        console.error("[Automation] ❌ Global Payout Error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
