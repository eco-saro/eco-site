import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/mongodb";
import { Settings } from "@/models/settings.model";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({});
        }

        return NextResponse.json({ settings });
    } catch (error: any) {
        console.error("Admin Settings GET Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await db();
        const body = await req.json();

        // Whitelist allowed fields to prevent mass assignment
        const allowedFields = ["commissionRate", "supportEmail", "supportPhone", "lowStockThreshold"];
        const updateData: any = {};

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No valid fields provided" }, { status: 400 });
        }

        let settings = await Settings.findOne();
        if (settings) {
            Object.assign(settings, updateData);
        } else {
            settings = new Settings(updateData);
        }

        await settings.save();

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            settings
        });

    } catch (error: any) {
        console.error("Admin Settings PATCH Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
