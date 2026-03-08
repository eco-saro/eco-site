import { NextResponse } from "next/server"
import { User } from "@/models/user"
import { Post } from "@/models/post.model"
import dbConnect from "@/lib/dbconnect"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect()

        const userId = params.id
        const user = await User.findById(userId).select("-password -otp -otpExpires -otpAttempts")

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const postCount = await Post.countDocuments({ author: userId })
        const recentPosts = await Post.find({ author: userId }).sort({ createdAt: -1 }).limit(5)

        return NextResponse.json({
            success: true,
            user,
            stats: {
                postCount,
                followerCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0
            },
            recentPosts
        })
    } catch (error) {
        console.error("Error fetching public profile:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
