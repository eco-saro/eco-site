import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { User } from "@/models/user";
import { Vendor } from "@/models/vendor";
import { Product } from "@/models/product.model";
import { Order } from "@/models/order.model";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();

        const now = new Date();
        const firstDay = startOfMonth(now);
        const lastDay = endOfMonth(now);

        const [userCount, vendorCount, productCount, orderCount, orders] = await Promise.all([
            User.countDocuments(),
            Vendor.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Order.find({
                status: { $ne: "Cancelled" },
                createdAt: { $gte: firstDay, $lte: lastDay }
            }).select("totalAmount products status")
        ]);

        const vendorStatsMap: Record<string, { id: string, name: string, revenue: number, commission: number, pendingPayout: number }> = {};
        let totalRevenue = 0;
        let totalPlatformCommission = 0;
        const pendingVendors = await Vendor.countDocuments({ status: "pending" });

        orders.forEach(order => {
            totalRevenue += order.totalAmount || 0;
            order.products?.forEach((p: any) => {
                const itemTotal = p.price * p.quantity;
                const commission = p.commissionAmount || Math.round(itemTotal * 0.1);
                const net = p.netAmount || (itemTotal - commission);
                totalPlatformCommission += commission;

                if (p.vendor) {
                    const vId = p.vendor.toString();
                    if (!vendorStatsMap[vId]) {
                        vendorStatsMap[vId] = { id: vId, name: "Loading...", revenue: 0, commission: 0, pendingPayout: 0 };
                    }
                    vendorStatsMap[vId].revenue += itemTotal;
                    vendorStatsMap[vId].commission += commission;

                    // Only count toward "To Pay" if delivered/completed but not yet paid
                    // This aligns with the /admin/payouts logic for settleable amounts
                    const isSettleable = ["Delivered", "completed"].includes(order.status);
                    if (isSettleable && p.payoutStatus !== "COMPLETED" && !p.refunded) {
                        vendorStatsMap[vId].pendingPayout += net;
                    }
                }
            });
        });

        // Get vendor names
        const vendorDetails = await Vendor.find({ _id: { $in: Object.keys(vendorStatsMap) } }).select("businessName");
        vendorDetails.forEach(v => {
            if (vendorStatsMap[v._id.toString()]) {
                vendorStatsMap[v._id.toString()].name = v.businessName;
            }
        });

        const topVendors = Object.values(vendorStatsMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            stats: {
                users: userCount,
                vendors: vendorCount,
                products: productCount,
                orders: orderCount,
                totalRevenue,
                platformCommission: totalPlatformCommission,
                pendingVendors,
                topVendors
            }
        });

    } catch (error: any) {
        console.error("Admin Stats API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
