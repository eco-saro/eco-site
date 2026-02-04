import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Order } from "@/models/order.model";
import { Vendor } from "@/models/vendor";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get("vendorId");
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        // If no vendorId, return list of all approved vendors for the dropdown
        if (!vendorId) {
            const vendors = await Vendor.find({ status: "approved" }).select("businessName _id");
            return NextResponse.json({ vendors });
        }

        const vendor = await Vendor.findById(vendorId).select("businessName payoutDetails");

        const startDate = startDateStr ? parseISO(startDateStr) : startOfMonth(new Date());
        const endDate = endDateStr ? parseISO(endDateStr) : endOfMonth(new Date());

        // Find all orders for this vendor in the date range
        // We look for delivered/completed orders for current month payouts
        // OR previous orders that are still PENDING
        const orders = await Order.find({
            "products.vendor": vendorId,
            status: { $in: ["Delivered", "completed"] },
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        let grossSales = 0;
        let totalCommission = 0;
        let totalRefunds = 0;
        let amountToPay = 0;
        const items = [];

        for (const order of orders) {
            const vendorProducts = order.products.filter(
                (p: any) => p.vendor.toString() === vendorId.toString()
            );

            for (const product of vendorProducts) {
                const itemTotal = product.price * product.quantity;
                const commission = product.commissionAmount || Math.round(itemTotal * 0.1);
                const net = product.netAmount || (itemTotal - commission);

                if (product.refunded) {
                    totalRefunds += net;
                } else {
                    grossSales += itemTotal;
                    totalCommission += commission;

                    if (product.payoutStatus !== "COMPLETED") {
                        amountToPay += net;
                    }
                }

                items.push({
                    orderId: order._id,
                    orderDate: order.createdAt,
                    productName: product.name,
                    price: product.price,
                    quantity: product.quantity,
                    total: itemTotal,
                    commission,
                    net,
                    status: product.payoutStatus,
                    isRefunded: product.refunded,
                    payoutReference: product.payoutReference,
                    payoutDate: product.payoutDate,
                    isLocked: product.isLocked
                });
            }
        }

        return NextResponse.json({
            metrics: {
                grossSales,
                totalCommission,
                totalRefunds,
                amountToPay,
                totalOrders: orders.length
            },
            vendor: {
                name: vendor?.businessName,
                bankDetails: vendor?.payoutDetails
            },
            items
        });

    } catch (error: any) {
        console.error("Admin Payouts API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
