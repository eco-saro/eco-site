import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Vendor } from "@/models/vendor";
import { EmailService } from "@/lib/email-service";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const vendors = await Vendor.find().sort({ createdAt: -1 });

        return NextResponse.json({ vendors });
    } catch (error: any) {
        console.error("Admin Vendors GET Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { vendorId, status } = await req.json();

        if (!vendorId || !status) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await db();
        const vendor = await Vendor.findByIdAndUpdate(
            vendorId,
            { status },
            { new: true }
        );

        if (!vendor) {
            return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
        }

        // Send confirmation email if approved
        if (status === 'approved' && vendor.businessEmail) {
            await EmailService.notifyVendorApproval(vendor.businessEmail, vendor.businessName);
        }

        return NextResponse.json({
            success: true,
            message: `Vendor status updated to ${status}`,
            vendor
        });
    } catch (error: any) {
        console.error("Admin Vendors PATCH Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
