import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "../../../lib/mongodb";
import { Order } from "../../../models/order.model";
import { Vendor } from "../../../models/vendor";

/**
 * GET /api/orders
 * Gets all orders for the currently authenticated vendor.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const isDashboard = searchParams.get('dashboard') === 'true';

    let orderFilter: any = {};

    if (userRole === "vendor" && isDashboard) {
      const vendor = await Vendor.findOne({ user: userId });
      if (!vendor) {
        return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
      }
      orderFilter = { 'products.vendor': vendor._id };
    } else {
      orderFilter = { user: userId };
    }

    const orders = await Order.find(orderFilter)
      .populate('user', 'name email')
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(orderFilter);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}