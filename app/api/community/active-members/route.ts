import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/mongodb"
import { Post } from "@/models/post.model"

export async function GET(req: NextRequest) {
    try {
        await db()

        const session = await getServerSession(authOptions)
        const currentUserId = session?.user?.id

        const { searchParams } = new URL(req.url)
        const limit = Number.parseInt(searchParams.get("limit") || "5")

        const activeMembers = await Post.aggregate([
            {
                $group: {
                    _id: "$author",
                    postCount: { $sum: 1 },
                },
            },
            {
                $sort: { postCount: -1 },
            },
            {
                $limit: limit,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    _id: "$user._id",
                    name: "$user.name",
                    avatar: "$user.image",
                    expertise: "$user.role",
                    postCount: 1,
                    followers: "$user.followers",
                },
            },
        ])

        const formattedMembers = activeMembers.map(member => ({
            ...member,
            isFollowing: currentUserId ? member.followers?.some((id: any) => id.toString() === currentUserId) : false,
            followerCount: member.followers?.length || 0
        }))

        return NextResponse.json({ activeMembers: formattedMembers })
    } catch (error) {
        console.error("Error fetching active members:", error)
        return NextResponse.json(
            { error: "Failed to fetch active members" },
            { status: 500 }
        )
    }
}
