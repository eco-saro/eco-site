import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/mongodb";
import { Order } from "@/models/order.model";
import crypto from "node:crypto";

/**
 * POST /api/webhooks/shiprocket
 * Handles status updates from Shiprocket.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Shiprocket sends a signature in the header to verify the request
        // You should configure a webhook secret in Shiprocket dashboard
        const signature = req.headers.get("x-api-key");
        // Note: Shiprocket webhook verification varies, sometimes it's a simple API key
        // For production, you should implement robust verification.

        await db();

        const {
            order_id,
            shipment_id,
            status,
            awb,
            courier_name,
            tracking_url
        } = body;

        // Map Shiprocket status to our internal status if needed
        // Shiprocket statuses: 6 (Shipped), 7 (Delivered), 8 (Cancelled), etc.
        let internalStatus = "Processing";
        if (status === "6" || status === "Shipped") internalStatus = "Shipped";
        if (status === "7" || status === "Delivered") internalStatus = "Delivered";
        if (status === "8" || status === "Cancelled") internalStatus = "Cancelled";

        const updatedOrder = await Order.findOneAndUpdate(
            { shiprocketOrderId: order_id },
            {
                shiprocketAWB: awb,
                shiprocketCourier: courier_name,
                trackingUrl: tracking_url,
                shippingStatus: status,
                status: internalStatus
            },
            { new: true }
        );

        if (!updatedOrder) {
            console.warn(`Webhook received for unknown order: ${order_id}`);
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Shiprocket Webhook Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
