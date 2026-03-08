import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { User } from "@/models/user"
import dbConnect from "@/lib/dbconnect"
import mongoose from "mongoose"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { targetUserId } = await req.json()
        if (!targetUserId) {
            return NextResponse.json({ error: "Target User ID is required" }, { status: 400 })
        }

        const currentUserId = session.user.id
        if (currentUserId === targetUserId) {
            return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
        }

        await dbConnect()

        const targetUser = await User.findById(targetUserId)
        const currentUser = await User.findById(currentUserId)

        if (!targetUser || !currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Initialize arrays if they don't exist
        if (!targetUser.followers) targetUser.followers = []
        if (!currentUser.following) currentUser.following = []

        const isFollowing = currentUser.following.some(id => id.toString() === targetUserId)

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId)
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId)
        } else {
            // Follow
            currentUser.following.push(new mongoose.Types.ObjectId(targetUserId))
            targetUser.followers.push(new mongoose.Types.ObjectId(currentUserId))
        }

        await currentUser.save()
        await targetUser.save()

        return NextResponse.json({
            success: true,
            isFollowing: !isFollowing,
            followerCount: targetUser.followers.length
        })

    } catch (error) {
        console.error("Error toggling follow:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
