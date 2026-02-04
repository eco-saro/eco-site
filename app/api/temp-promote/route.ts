import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/mongodb";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

        await db();
        const user = await User.findOneAndUpdate(
            { email },
            { role: "admin" },
            { new: true }
        );

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({
            message: `Successfully promoted ${user.name} to admin. RELOGIN NOW.`,
            role: user.role
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
