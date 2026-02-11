import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/mongodb"
import { Post } from "@/models/post.model"
import { User } from "@/models/user"

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await db()

        const { id } = params
        const body = await req.json()
        const { content, parentId } = body

        if (!content) {
            return NextResponse.json(
                { error: "Comment content is required" },
                { status: 400 }
            )
        }

        // Sanitization and length limits
        const sanitizedContent = content.replaceAll(/<[^>]*>?/gm, '').trim().substring(0, 1000);

        if (!sanitizedContent) {
            return NextResponse.json(
                { error: "Comment contains invalid characters or is too short" },
                { status: 400 }
            )
        }

        const userId = session.user.id

        // Find user by email to get ObjectId if session.user.id is not available (fallback)
        let userObjectId = userId
        if (!userObjectId) {
            const user = await User.findOne({ email: session.user.email })
            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 })
            }
            userObjectId = user._id
        }

        const post = await Post.findById(id)

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        const newComment = {
            content: sanitizedContent,
            author: userObjectId,
            parentId: parentId || undefined,
            likes: [],
            createdAt: new Date(),
        }

        post.comments.push(newComment)
        await post.save()

        // Populate the author of the new comment to return it
        const populatedPost = await Post.findById(id).populate({
            path: "comments.author",
            select: "name image"
        })

        const addedComment = populatedPost.comments[populatedPost.comments.length - 1]

        return NextResponse.json(
            {
                message: "Comment added successfully",
                comment: {
                    _id: addedComment._id,
                    content: addedComment.content,
                    author: {
                        name: addedComment.author.name,
                        avatar: addedComment.author.image
                    },
                    parentId: addedComment.parentId,
                    likes: addedComment.likes,
                    createdAt: addedComment.createdAt
                },
                commentsCount: post.comments.length
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error adding comment:", error)
        return NextResponse.json(
            { error: "Failed to add comment" },
            { status: 500 }
        )
    }
}
