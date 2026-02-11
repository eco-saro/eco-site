import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/mongodb";
import { Payout } from "@/models/payout.model";
import { Order } from "@/models/order.model";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    if (!WEBHOOK_SECRET) {
        console.error("[Razorpay Webhook] ❌ RAZORPAY_WEBHOOK_SECRET is not configured.");
        return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
    }
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Security Verification
    if (!signature) {
        return NextResponse.json({ message: "Signature missing" }, { status: 400 });
    }

    const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== signature) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    await db();

    try {
        const { event: eventType, payload } = event;

        switch (eventType) {
            case "transfer.processed":
                await handleTransferProcessed(payload.transfer.entity);
                break;

            case "transfer.failed":
                await handleTransferFailed(payload.transfer.entity);
                break;

            case "payout.processed":
                await handlePayoutProcessed(payload.payout.entity);
                break;

            case "payout.failed":
                await handlePayoutFailed(payload.payout.entity);
                break;

            default:
                console.log(`[Webhook] Unhandled Razorpay event: ${eventType}`);
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("[Webhook] Error processing Razorpay event:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

async function handleTransferProcessed(transfer: any) {
    console.log(`[Webhook] ✅ Transfer Processed: ${transfer.id}`);

    // Update Payout History
    await Payout.findOneAndUpdate(
        { razorpayTransferId: transfer.id },
        { payoutStatus: "COMPLETED", processedAt: new Date() }
    );

    // Sync Order product status
    await Order.updateOne(
        { "products.razorpayTransferId": transfer.id },
        { $set: { "products.$.payoutStatus": "COMPLETED" } }
    );
}

async function handleTransferFailed(transfer: any) {
    const reason = transfer.error_description || "Unknown transfer error";
    console.log(`[Webhook] ❌ Transfer Failed: ${transfer.id}. Reason: ${reason}`);

    await Payout.findOneAndUpdate(
        { razorpayTransferId: transfer.id },
        { payoutStatus: "FAILED", blockReason: reason }
    );

    await Order.updateOne(
        { "products.razorpayTransferId": transfer.id },
        { $set: { "products.$.payoutStatus": "FAILED", "products.$.payoutBlockReason": reason } }
    );
}

// Similar handlers for standard Payouts if used
async function handlePayoutProcessed(payout: any) {
    await Payout.findOneAndUpdate(
        { razorpayPayoutId: payout.id },
        { payoutStatus: "COMPLETED", processedAt: new Date() }
    );
}

async function handlePayoutFailed(payout: any) {
    await Payout.findOneAndUpdate(
        { razorpayPayoutId: payout.id },
        { payoutStatus: "FAILED", blockReason: payout.failure_reason }
    );
}
