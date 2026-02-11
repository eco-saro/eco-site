import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "../../../lib/mongoose";

// Cloudinary config moved inside handler

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { message: "Server Configuration Error" },
                { status: 500 }
            );
        }

        // Check for common mistake: quotes in env vars
        if (cloudName.startsWith('"') || cloudName.startsWith("'") ||
            apiKey.startsWith('"') || apiKey.startsWith("'") ||
            apiSecret.startsWith('"') || apiSecret.startsWith("'")) {
            console.error("WARNING: Environment variables appear to contain quotes. Please remove them from .env.local");
            return NextResponse.json(
                { message: "Configuration Error: Environment variables contain quotes. Please remove them." },
                { status: 500 }
            );
        }

        // Check for truncated secret
        if (apiSecret.length < 20) {
            console.error(`WARNING: Cloudinary API Secret is too short (${apiSecret.length} chars). It should be around 27 characters.`);
            return NextResponse.json(
                { message: `Configuration Error: Cloudinary API Secret is too short (${apiSecret.length} chars). Please copy the full secret from your Cloudinary Dashboard.` },
                { status: 500 }
            );
        }

        cloudinary.config({
            cloud_name: cloudName.replaceAll(/['"]/g, ''), // Strip quotes just in case
            api_key: apiKey.replaceAll(/['"]/g, ''),
            api_secret: apiSecret.replaceAll(/['"]/g, ''),
        });

        // 1. Authentication Check
        const session = await getServerSession(authOptions);
        console.log("Upload API Session:", JSON.stringify(session, null, 2));

        if (!session) {
            console.error("Upload: No session found");
            return NextResponse.json({ message: "Unauthorized: No session" }, { status: 401 });
        }
        if (!session.user || (session.user as any).role !== "vendor") {
            console.error("Upload: User is not a vendor", session.user);
            return NextResponse.json({ message: "Unauthorized: Not a vendor" }, { status: 401 });
        }

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 });
        }

        // MIME type validation
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ message: "Invalid file type. Only JPG, PNG, and WEBP images are allowed." }, { status: 400 });
        }

        // 3. Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "eco-site/products", // Optional: organize uploads in a folder
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        // 5. Return the URL
        return NextResponse.json({ url: result.secure_url }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
