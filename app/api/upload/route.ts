import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "../../../lib/mongoose";

// Cloudinary config moved inside handler

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { message: "Server Configuration Error: Cloudinary credentials missing." },
                { status: 500 }
            );
        }

        cloudinary.config({
            cloud_name: cloudName.trim().replaceAll(/['"]/g, ''),
            api_key: apiKey.trim().replaceAll(/['"]/g, ''),
            api_secret: apiSecret.trim().replaceAll(/['"]/g, ''),
        });

        // 1. Authentication Check
        // Use both getServerSession and getToken for robustness in different environments
        const session = await getServerSession(authOptions);
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        console.log("Upload API Auth Check:", {
            hasSession: !!session,
            hasToken: !!token,
            userId: session?.user?.id || token?.sub
        });

        if (!session && !token) {
            console.error("Upload: No session or token found");
            return NextResponse.json({ message: "Unauthorized: No session found. Please try logging in again." }, { status: 401 });
        }

        // Remove the restriction that only vendors can upload
        // Users just need to be authenticated

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

        const folder = (formData.get("folder") as string) || "eco-site/general";

        // 4. Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder, // Dynamic folder support
                },
                (error, result) => {
                    if (error) {
                        let errorMessage = "Unknown upload error";
                        if (error instanceof Error) {
                            errorMessage = error.message;
                        } else if (typeof error === 'object') {
                            errorMessage = JSON.stringify(error);
                        } else {
                            errorMessage = String(error);
                        }
                        reject(new Error(errorMessage));
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
