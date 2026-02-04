import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "../../../lib/mongodb";
import { Order } from "../../../models/order.model";
import { Vendor } from "../../../models/vendor";
import { Product } from "../../../models/product.model";
import { Settings } from "../../../models/settings.model";
import { shiprocket } from "../../../lib/shiprocket";

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

    if (userRole === "admin") {
      // Admins see everything
      orderFilter = {};
    } else if (userRole === "vendor" && isDashboard) {
      const vendor = await Vendor.findOne({ user: userId });
      if (!vendor) {
        return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
      }
      orderFilter = { 'products.vendor': vendor._id };
    } else {
      // Buyers (and vendors in non-dashboard view) see their own purchases
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

/**
 * POST /api/orders
 * Creates a new order (primarily for COD).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = await req.json();

    // 0. Get Commission Rate
    const settings = await Settings.findOne();
    const commissionRate = settings?.commissionRate ?? 10;

    // 1. Initial Stock Validation
    for (const item of items) {
      const id = item.id || item.productId;
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json({ message: `Product ${item.name} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
    }

    // 2. Process Items and Decrement Stock
    const processedItems = await Promise.all(items.map(async (item: any) => {
      const id = item.id || item.productId;
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      const price = item.price;
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      const commissionAmount = Math.round(itemTotal * (commissionRate / 100));
      const netAmount = itemTotal - commissionAmount;

      return {
        product: id,
        vendor: product?.vendor || item.vendor,
        name: item.name,
        quantity,
        price,
        image: item.image,
        commissionAmount,
        netAmount,
        payoutStatus: 'PENDING',
        isLocked: false
      }
    }));

    const newOrder = await Order.create({
      user: (session.user as any).id,
      products: processedItems,
      totalAmount,
      status: paymentMethod === 'COD' ? 'Processing' : 'Pending',
      paymentMethod: paymentMethod || 'COD',
      shippingAddress
    });

    // Create Order in Shiprocket
    try {
      console.log(`[Orders] 🔄 Initiating Shiprocket sync (COD) for order ${newOrder._id}`);

      const shiprocketOrder = await shiprocket.createOrder({
        order_id: newOrder._id.toString(),
        order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        billing_customer_name: shippingAddress?.name?.split(' ')[0] || session.user.name?.split(' ')[0] || "Customer",
        billing_last_name: shippingAddress?.name?.split(' ').slice(1).join(' ') || "User",
        billing_address: shippingAddress?.street || "Not Provided",
        billing_city: shippingAddress?.city || "Not Provided",
        billing_pincode: shippingAddress?.pincode || "000000",
        billing_state: shippingAddress?.state || "Not Provided",
        billing_country: shippingAddress?.country || "India",
        billing_email: session.user.email || "no-email@provided.com",
        billing_phone: shippingAddress?.phone || "0000000000",
        shipping_is_billing: true,
        order_items: processedItems.map((item: any) => ({
          name: item.name,
          sku: item.product.toString(),
          units: item.quantity,
          selling_price: item.price
        })),
        payment_method: "COD",
        sub_total: totalAmount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      });

      if (shiprocketOrder?.order_id) {
        console.log(`[Orders] ✅ Shiprocket order synchronized successfully (COD). SR_ID: ${shiprocketOrder.order_id}`);
        await Order.findByIdAndUpdate(newOrder._id, {
          shiprocketOrderId: shiprocketOrder.order_id,
          shiprocketShipmentId: shiprocketOrder.shipment_id,
          shippingStatus: "Processing"
        });
      }
    } catch (srError: any) {
      console.error("[Orders] ⚠️ Shiprocket Sync Failed (Non-blocking):", srError.message || srError);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder._id,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}