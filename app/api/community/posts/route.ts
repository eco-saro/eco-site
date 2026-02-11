import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/mongodb"
import { Post } from "@/models/post.model"
import { User } from "@/models/user"
import "@/models/community.model"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
    try {
        await db()

        const session = await getServerSession(authOptions)
        const userId = session?.user?.id

        const { searchParams } = new URL(req.url)
        const type = searchParams.get("type")
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const page = Number.parseInt(searchParams.get("page") || "1")
        const skip = (page - 1) * limit

        const communityId = searchParams.get("communityId")

        const query: any = {}
        if (type && type !== "all") {
            query.type = type
        }
        if (communityId) {
            if (/^[0-9a-fA-F]{24}$/.test(communityId)) {
                query.community = new mongoose.Types.ObjectId(communityId)
            } else {
                // If invalid community ID, return empty list
                return NextResponse.json({
                    posts: [],
                    pagination: { total: 0, page: 1, pages: 0 },
                })
            }
        } else {
            // If no communityId is provided (main feed), exclude posts that belong to a community
            query.community = { $in: [null, undefined] }
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "name image")
            .populate({ path: "community", select: "name slug icon", strictPopulate: false })
            .lean()

        const total = await Post.countDocuments(query)

        // Format posts for frontend
        const formattedPosts = posts.map((post: any) => ({
            _id: post._id,
            title: post.title,
            content: post.content,
            image: post.image,
            author: {
                id: post.author?._id,
                name: post.author?.name || "Unknown User",
                avatar: post.author?.image || "",
                isVerified: false, // You might want to add this to User model later
                isFollowing: false, // Logic for following would go here
            },
            community: post.community ? {
                name: post.community.name,
                slug: post.community.slug,
                icon: post.community.icon
            } : null,
            type: post.type,
            likes: post.likes?.length || 0,
            isLiked: userId ? post.likes?.some((id: any) => id.toString() === userId) : false,
            comments: post.comments?.length || 0,
            createdAt: post.createdAt,
        }))

        return NextResponse.json({
            posts: formattedPosts,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("Error fetching posts:", error)
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await db()

        const body = await req.json()
        const { title, content, type, image, communityId } = body

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            )
        }

        // Basic sanitization and length limits
        const sanitize = (text: string) => text.replaceAll(/<[^>]*>?/gm, '').trim();

        const sanitizedTitle = sanitize(title).substring(0, 200);
        const sanitizedContent = sanitize(content).substring(0, 5000);

        if (!sanitizedTitle || !sanitizedContent) {
            return NextResponse.json(
                { error: "Post contains invalid characters or is too short after sanitization" },
                { status: 400 }
            )
        }

        // Find user by email to get ObjectId
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const newPost = await Post.create({
            title: sanitizedTitle,
            content: sanitizedContent,
            type: type || "discussion",
            image,
            author: user._id,
            community: communityId ? new mongoose.Types.ObjectId(communityId) : undefined,
        })

        return NextResponse.json(
            { message: "Post created successfully", post: newPost },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error creating post:", error)
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        )
    }
}
