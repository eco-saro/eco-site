import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "../../../../lib/mongodb";
import { Order } from "../../../../models/order.model";
import { Vendor } from "../../../../models/vendor";
import { Product } from "../../../../models/product.model";

interface IParams {
  params: { orderId: string };
}

/**
 * GET /api/orders/[orderId]
 * Gets a specific order if it belongs to the authenticated vendor.
 */
export async function GET(req: Request, { params }: IParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    let order;

    if (userRole === "vendor") {
      const vendor = await Vendor.findOne({ user: userId }).select('products');
      if (vendor) {
        order = await Order.findOne({
          _id: params.orderId,
          'products.vendor': vendor._id
        })
          .populate('user', 'name email')
          .populate('products.product', 'name price images');

        if (order) {
          // Security: Filter products to only show those belonging to this vendor
          order = order.toObject();
          order.products = order.products.filter((p: any) => p.vendor.toString() === vendor._id.toString());
        }
      }
    }

    // If not found as vendor order, check if it's the buyer's own order
    if (!order) {
      order = await Order.findOne({
        _id: params.orderId,
        user: userId
      })
        .populate('user', 'name email')
        .populate('products.product', 'name price images');
    }

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

    const existingOrder = await Order.findOne({ _id: params.orderId, 'products.vendor': vendor._id });
    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found or you don't have permission to update it." }, { status: 404 });
    }

    // Restock if transitioning to Cancelled
    if (status === "Cancelled" && existingOrder.status !== "Cancelled") {
      for (const item of existingOrder.products) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    // Security: Only update global status if authorized (already checked by findOne above)
    // In a multi-vendor system, you might want to update status PER PRODUCT.
    // For now, we ensure the vendor owns products in this order.

    const updatedOrder = await Order.findByIdAndUpdate(
      params.orderId,
      { status: status },
      { new: true }
    );

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to update order ${params.orderId}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}