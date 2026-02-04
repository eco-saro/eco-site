import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Refund } from "@/models/refund.model";
import { Order } from "@/models/order.model";
import { Product } from "@/models/product.model";
import { EmailService } from "@/lib/email-service";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "PENDING";

        const refunds = await Refund.find({ status })
            .populate("user", "name email")
            .populate("vendor", "businessName")
            .populate("order", "status createdAt totalAmount")
            .sort({ createdAt: -1 });

        return NextResponse.json({ refunds });
    } catch (error: any) {
        console.error("Admin Refunds GET Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const { refundId, status, adminNotes } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const refund = await Refund.findById(refundId);
        if (!refund) {
            return NextResponse.json({ message: "Refund request not found" }, { status: 404 });
        }

        refund.status = status;
        refund.adminNotes = adminNotes;
        await refund.save();

        if (status === 'APPROVED') {
            // 1. Mark item as refunded in the order
            const order = await Order.findById(refund.order);
            if (order?.products?.[refund.itemIndex]) {
                order.products[refund.itemIndex].refunded = true;
                // If it was COD or delivered, we should also ensure payout is blocked or marked as refunded
                order.products[refund.itemIndex].payoutStatus = 'FAILED'; // Or 'BLOCKED'
                order.products[refund.itemIndex].payoutBlockReason = 'Order Item Refunded';
                await order.save();

                // 2. Restock the product
                const productId = order.products[refund.itemIndex].product;
                const quantity = order.products[refund.itemIndex].quantity;
                await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
            }
        }

        // 3. Notify User
        const user = await User.findById(refund.user);
        if (user?.email) {
            await EmailService.notifyRefundDecision(
                user.email,
                user.name || "Customer",
                refund.order.toString(),
                status,
                adminNotes || "No specific notes provided."
            );
        }

        return NextResponse.json({
            success: true,
            message: `Refund ${status.toLowerCase()} successfully`
        });

    } catch (error: any) {
        console.error("Admin Refunds PATCH Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
