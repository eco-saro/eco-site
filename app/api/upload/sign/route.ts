import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
    const body = await request.json();
    const { paramsToSign } = body;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
        return NextResponse.json({ error: "Cloudinary API secret not found" }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({ signature });
}
