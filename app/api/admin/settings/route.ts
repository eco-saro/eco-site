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

        let settings = await Settings.findOne();
        if (settings) {
            Object.assign(settings, body);
        } else {
            settings = new Settings(body);
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
