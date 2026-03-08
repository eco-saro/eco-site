"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Heart, MessageSquare, Share2, ArrowLeft, MoreHorizontal, Reply } from "lucide-react"
import Image from "next/image"
import { CldImage } from 'next-cloudinary'
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
    _id: string
    content: string
    author: {
        name: string
        avatar: string
    }
    parentId?: string
    likes: string[]
    createdAt: string
    children?: Comment[]
}

interface PostDetails {
    _id: string
    title: string
    content: string
    image?: string
    author: {
        id: string
        name: string
        avatar: string
    }
    community?: {
        name: string
        slug: string
        icon?: string
    }
    type: string
    likes: number
    isLiked: boolean
    comments: Comment[]
    createdAt: string
}

export default function PostPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [post, setPost] = useState<PostDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState("")

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/community/posts/${params.id}`)
            const data = await res.json()
            if (res.ok) {
                setPost(data.post)
            }
        } catch (error) {
            console.error("Error fetching post:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchPost()
        }
    }, [params.id])

    const handleLike = async () => {
        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please sign in to like a post",
                variant: "destructive",
            })
            router.push("/login")
            return
        }

        if (!post) return

        try {
            const res = await fetch(`/api/community/posts/${post._id}/like`, {
                method: "POST",
            })
            const data = await res.json()
            if (res.ok) {
                setPost({ ...post, likes: data.likes, isLiked: data.isLiked })
            }
        } catch (error) {
            console.error("Error liking post:", error)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return

        try {
            const res = await fetch(`/api/community/posts/${post?._id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Post deleted successfully",
                })
                router.push("/community")
            } else {
                const data = await res.json()
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete post",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting post:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        }
    }

    const handleComment = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault()
        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please sign in to comment",
                variant: "destructive",
            })
            router.push("/login")
            return
        }

        if (!post) return

        const content = parentId ? replyContent : comment
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/community/posts/${post._id}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content, parentId }),
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Comment added successfully",
                })
                if (parentId) {
                    setReplyContent("")
                    setReplyingTo(null)
                } else {
                    setComment("")
                }
                fetchPost() // Refresh to show new comment
            }
        } catch (error) {
            console.error("Error commenting:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const buildCommentTree = (comments: Comment[]) => {
        const commentMap: { [key: string]: Comment } = {}
        const roots: Comment[] = []

        // First pass: create map and initialize children
        comments.forEach(comment => {
            commentMap[comment._id] = { ...comment, children: [] }
        })

        // Second pass: link children to parents
        comments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].children!.push(commentMap[comment._id])
            } else {
                roots.push(commentMap[comment._id])
            }
        })

        return roots
    }

    const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
        const isReplying = replyingTo === comment._id

        return (
            <div className={`flex flex-col gap-2 ${depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">{comment.author.name}</span>
                            <span className="text-gray-500 text-xs">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-gray-800 text-sm">{comment.content}</p>

                        <div className="flex items-center gap-4 pt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-900"
                                onClick={() => setReplyingTo(isReplying ? null : comment._id)}
                            >
                                <Reply className="h-3 w-3 mr-1" /> Reply
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:text-gray-900">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </div>

                        {isReplying && (
                            <div className="mt-3 pl-2">
                                <form onSubmit={(e) => handleComment(e, comment._id)} className="space-y-3">
                                    <Textarea
                                        placeholder={`Reply to ${comment.author.name}...`}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="min-h-[80px] text-sm"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setReplyingTo(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" size="sm" disabled={isSubmitting}>
                                            {isSubmitting ? "Reply..." : "Reply"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {comment.children && comment.children.length > 0 && (
                    <div className="space-y-2">
                        {comment.children.map(child => (
                            <CommentItem key={child._id} comment={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Post not found</h2>
                <Button variant="link" onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const commentTree = buildCommentTree(post.comments)

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 pt-2">
                            <Button variant="ghost" size="sm" className={`flex flex-col items-center gap-1 h-auto py-2 ${post.isLiked ? "text-red-500" : "text-gray-500"}`} onClick={handleLike}>
                                <Heart className={`h-6 w-6 ${post.isLiked ? "fill-current" : ""}`} />
                                <span className="font-bold">{post.likes}</span>
                            </Button>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    {post.community && (
                                        <>
                                            <Link href={`/community/${post.community.slug}`} className="font-bold text-black hover:underline">
                                                c/{post.community.name}
                                            </Link>
                                            <span>•</span>
                                        </>
                                    )}
                                    <span>Posted by {post.author.name}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                </div>

                                {session?.user?.id === post.author.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                onClick={handleDelete}
                                            >
                                                Delete Post
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold">{post.title}</h1>
                            <Badge variant="outline">{post.type}</Badge>

                            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                                {post.content}
                            </div>

                            {post.image && (
                                <div className="relative h-96 w-full overflow-hidden rounded-lg mt-4 border bg-gray-50">
                                    <CldImage
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 1200px) 100vw, 1200px"
                                        priority
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MessageSquare className="h-5 w-5" />
                                    <span>{post.comments.length} Comments</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://ecosaro.com' : window.location.origin
                                    const shareUrl = `${baseUrl}/community/post/${params.id}`
                                    if (navigator.share) {
                                        navigator.share({
                                            title: post.title,
                                            text: `Check out this post on EcoSaro: ${post.title}`,
                                            url: shareUrl,
                                        }).catch((err) => {
                                            console.error("Error sharing:", err)
                                        })
                                    } else {
                                        navigator.clipboard.writeText(shareUrl).then(() => {
                                            toast({
                                                title: "Link copied",
                                                description: "Post link copied to clipboard",
                                            })
                                        }).catch((err) => {
                                            console.error("Error copying to clipboard:", err)
                                        })
                                    }
                                }}>
                                    <Share2 className="h-4 w-4 mr-2" /> Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={(e) => handleComment(e)} className="space-y-4">
                            <Textarea
                                placeholder="What are your thoughts?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                className="min-h-[100px]"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Posting..." : "Comment"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {commentTree.map((comment) => (
                        <Card key={comment._id}>
                            <CardContent className="p-2">
                                <CommentItem comment={comment} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
