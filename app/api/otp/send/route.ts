import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "../../../../lib/mongoose";
import { User } from "../../../../models/user";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Generate 6-digit OTP using crypto for security
        const crypto = await import("crypto");
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to User and reset attempts
        await User.findOneAndUpdate(
            { email: session.user.email },
            { otp, otpExpires, otpAttempts: 0 }
        );

        // Masked log for security
        console.log(`[OTP SERVICE] OTP generated for ${session.user.email.substring(0, 3)}***`);

        let emailSent = false;

        // --- EMAIL SENDING WITH NODEMAILER ---
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (smtpHost && smtpUser && smtpPass) {
            try {
                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: Number(smtpPort) || 587,
                    secure: Number(smtpPort) === 465, // true for 465, false for other ports
                    auth: {
                        user: smtpUser,
                        pass: smtpPass,
                    },
                });

                await transporter.sendMail({
                    from: `"EcoSaro Support" <${smtpUser}>`, // sender address
                    to: session.user.email, // list of receivers
                    subject: "Your EcoSaro Verification Code", // Subject line
                    text: `Your verification code is: ${otp}. It expires in 10 minutes.`, // plain text body
                    html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #16a34a;">EcoSaro Verification</h2>
                        <p>Hello,</p>
                        <p>Your verification code is:</p>
                        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                `, // html body
                });
                console.log(`[OTP SERVICE] Email sent to ${session.user.email}`);
                emailSent = true;
            } catch (emailError) {
                console.error("[OTP SERVICE] Failed to send email:", emailError);
            }
        } else {
            console.warn("[OTP SERVICE] SMTP credentials not found. Email skipped.");
        }

        if (!emailSent) {
            return NextResponse.json({ message: "OTP generated (check console), but failed to send via Email." });
        }

        return NextResponse.json({ message: "OTP sent successfully to your email" });
    } catch (error) {
        console.error("OTP Send Error:", error);
        return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
    }
}
