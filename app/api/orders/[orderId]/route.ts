import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "../../../../lib/mongodb";
import { Order } from "../../../../models/order.model";
import { Vendor } from "../../../../models/vendor";

interface IParams {
  params: { orderId: string };
}

/**
 * GET /api/orders/[orderId]
 * Gets a specific order if it belongs to the authenticated vendor.
 */
export async function GET(req: Request, { params }: IParams) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const vendor = await Vendor.findOne({ user: session.user.id }).select('products');
    if (!vendor) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const order = await Order.findOne({
      _id: params.orderId,
      'products.vendor': vendor._id
    })
      .populate('user', 'name email')
      .populate('products.product', 'name price images');

    if (!order) {
      return NextResponse.json({ message: "Order not found or you don't have permission to view it." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`Failed to fetch order ${params.orderId}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/orders/[orderId]
 * Updates the status of a specific order.
 */
export async function PUT(req: Request, { params }: IParams) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const vendor = await Vendor.findOne({ user: session.user.id }).select('products');
    if (!vendor) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: params.orderId, 'products.vendor': vendor._id },
      { status: status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found or you don't have permission to update it." }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to update order ${params.orderId}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}