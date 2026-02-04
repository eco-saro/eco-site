import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Order } from "@/models/order.model";
import { User } from "@/models/user";
import { Vendor } from "@/models/vendor";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const { searchParams } = new URL(req.url);

        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        let query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            // Search by Order ID or User Name/Email if possible
            // For now, let's support Order ID and search for users
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }).select("_id");

            const vendorSearchQuery = await Vendor.find({
                businessName: { $regex: search, $options: "i" }
            }).select("_id");

            query.$or = [
                { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : undefined },
                { user: { $in: users.map(u => u._id) } },
                { "products.vendor": { $in: vendorSearchQuery.map(v => v._id) } },
                { shiprocketOrderId: search }
            ].filter(q => q._id !== undefined || (q.user && q.user.$in.length > 0) || (q["products.vendor"] && q["products.vendor"].$in.length > 0) || q.shiprocketOrderId);

            // If the query.$or is empty, we force it to match nothing if search was provided but no users/vendors found
            if (query.$or.length === 0) {
                query._id = "000000000000000000000000"; // Dummy ID to return nothing
            }
        }

        const orders = await Order.find(query)
            .populate("user", "name email")
            .populate("products.vendor", "businessName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        return NextResponse.json({
            orders,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("Admin Orders API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
