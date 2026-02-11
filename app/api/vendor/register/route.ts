// /app/api/vendor/register/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import db from "@/lib/mongodb";
import { Vendor } from "@/models/vendor";
import { User } from "@/models/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Connect to DB inside the handler (deployment safe)
    await db();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const requiredFields = ["businessName", "businessEmail", "phoneNumber", "otpVerified"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const user = await User.findById(session.user.id);
    if (!user || !user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email verification required. Please verify your email via OTP first." },
        { status: 403 }
      );
    }

    // Check if vendor already exists
    const existing = await Vendor.findOne({ user: session.user.id });
    if (existing) {
      return NextResponse.json(
        { message: "Vendor already registered" },
        { status: 409 }
      );
    }

    // Create new vendor
    const vendor = new Vendor({
      user: session.user.id,
      businessName: body.businessName,
      businessEmail: body.businessEmail,
      businessPhone: body.phoneNumber,
      businessAddress: body.businessAddress || {
        street: "N/A",
        city: "N/A",
        state: "N/A",
        pincode: "000000",
        country: "India",
      },
      status: "pending",
    });

    await vendor.save();

    // Update user role to vendor
    await User.findByIdAndUpdate(session.user.id, { role: "vendor" });

    return NextResponse.json({
      message: "Vendor registered successfully",
      vendor,
    });
  } catch (err) {
    console.error("Vendor registration error:", err);

    // Check for Mongoose connection errors
    if (err instanceof mongoose.Error) {
      return NextResponse.json(
        { message: "Database connection error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
