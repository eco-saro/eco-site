
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "../../../lib/mongodb";
import { Product } from "../../../models/product.model";
import { Vendor } from "../../../models/vendor";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  images: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const vendor = await Vendor.findOne({ user: session.user.id });

    if (!vendor) {
      return NextResponse.json({ message: "Vendor profile not found for this user." }, { status: 404 });
    }



    const body = await req.json();

    const validationResult = productSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation Error", errors: validationResult.error.format() }, { status: 400 });
    }

    const { name, description, price, category, stock, images } = validationResult.data;

    const product = await Product.create({
      vendor: vendor._id,
      name,
      description,
      price,
      category,
      stock,
      images,
    });

    vendor.products.push(product._id);
    await vendor.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  await db();

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    if (role === 'vendor') {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || (session.user as any).role !== "vendor") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const vendor = await Vendor.findOne({ user: session.user.id });
      if (!vendor) {
        return NextResponse.json({ message: "Vendor profile not found for this user." }, { status: 404 });
      }
      const products = await Product.find({ vendor: vendor._id });
      return NextResponse.json(products);
    }

    // Default behavior: return all products for buyer-facing pages
    const products = await Product.find({});

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    const vendor = await Vendor.findOne({ user: session.user.id });
    if (!vendor) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const product = await Product.findOne({ _id: productId, vendor: vendor._id });
    if (!product) {
      return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 });
    }

    await Product.findByIdAndDelete(productId);

    // Remove product from vendor's product list
    vendor.products = vendor.products.filter((id: any) => id.toString() !== productId);
    await vendor.save();

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "vendor") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db();

  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    const vendor = await Vendor.findOne({ user: session.user.id });
    if (!vendor) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const product = await Product.findOne({ _id, vendor: vendor._id });
    if (!product) {
      return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 });
    }

    // Whitelist fields to prevent mass assignment (e.g., changing vendor ID)
    const { name, description, price, category, stock, images } = updateData;
    const sanitizedUpdate = { name, description, price, category, stock, images };

    const updatedProduct = await Product.findByIdAndUpdate(_id, sanitizedUpdate, { new: true });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
