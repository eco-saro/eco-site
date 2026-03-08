import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/mongodb"
import { Post } from "@/models/post.model"

export async function GET(req: NextRequest) {
    try {
        await db()

        const { searchParams } = new URL(req.url)
        const limit = Number.parseInt(searchParams.get("limit") || "5")

        const trendingPosts = await Post.aggregate([
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "author",
                    foreignField: "author",
                    as: "authorPosts",
                },
            },
            {
                $addFields: {
                    authorPostCount: { $size: "$authorPosts" },
                },
            },
            {
                $sort: { likesCount: -1 },
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    type: 1,
                    likesCount: 1,
                    authorPostCount: 1,
                },
            },
        ])

        // Map to match the frontend expectation (category -> type)
        const formattedTrending = trendingPosts.map(post => ({
            title: post.title,
            category: post.type.charAt(0).toUpperCase() + post.type.slice(1), // Capitalize
            posts: post.authorPostCount,
            views: (post.likesCount + 1) * 12 + Math.floor(Math.random() * 50),
            id: post._id
        }))

        return NextResponse.json({ trendingTopics: formattedTrending })
    } catch (error) {
        console.error("Error fetching trending posts:", error)
        return NextResponse.json(
            { error: "Failed to fetch trending posts" },
            { status: 500 }
        )
    }
}
