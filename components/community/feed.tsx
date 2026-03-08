"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Heart, MessageSquare, Share2, Calendar, MapPin, Clock, Plus, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "../ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface Post {
  _id: string
  title: string
  content: string
  image?: string
  author: {
    id: string
    name: string
    avatar: string
    isVerified: boolean
    isFollowing: boolean
  }
  type: string
  event?: {
    date: string
    time: string
    location: string
  }
  community?: {
    name: string
    slug: string
    icon?: string
  }
  likes: number
  isLiked: boolean
  comments: number
  createdAt: string
}

export default function Feed({ communityId }: { communityId?: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("latest")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("discussion")
  const [imageUrl, setImageUrl] = useState("")

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fetchPosts = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true)
    try {
      let url = `/api/community/posts?type=${activeTab === "latest" || activeTab === "popular" ? "all" : activeTab}&page=${pageNum}&limit=10`
      if (communityId) {
        url += `&communityId=${communityId}`
      }
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        if (pageNum === 1) {
          setPosts(data.posts)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        setHasMore(data.posts.length === 10)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("Failed to fetch posts:", res.status, res.statusText, errorData)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchPosts(1)
  }, [activeTab, communityId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "eco-site/community")

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed" }))
        throw new Error(errorData.message || "Upload failed")
      }

      const data = await response.json()
      setImageUrl(data.url)
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImageUrl("")
    setPreviewUrl(null)
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          type,
          image: imageUrl,
          communityId: communityId,
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Post created successfully",
        })
        setIsCreateOpen(false)
        setTitle("")
        setContent("")
        setImageUrl("")
        setPreviewUrl(null)
        setType("discussion")
        fetchPosts() // Refresh feed
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to create post",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Community Feed</h2>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {communityId ? "Make Community Post" : "Create Post"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
              <DialogDescription>
                Share your thoughts, questions, or tips with the community.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your post a clear title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Post Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  className="min-h-[100px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                {previewUrl ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload an image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="latest" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-4 overflow-x-auto">
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="question">Questions</TabsTrigger>
          <TabsTrigger value="tip">Tips</TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onLikeUpdate={(id, likes, isLiked) => {
                  setPosts(posts.map(p => p._id === id ? { ...p, likes, isLiked } : p))
                }} />
              ))}
              {hasMore && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchPosts(nextPage)
                  }}>Load More</Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No posts found. Be the first to create one!
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function PostCard({ post, onLikeUpdate }: { post: Post, onLikeUpdate: (id: string, likes: number, isLiked: boolean) => void }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

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

    try {
      const res = await fetch(`/api/community/posts/${post._id}/like`, {
        method: "POST",
      })
      const data = await res.json()
      if (res.ok) {
        onLikeUpdate(post._id, data.likes, data.isLiked)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const res = await fetch(`/api/community/posts/${post._id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Post deleted successfully",
        })
        // We need to refresh the feed. Since Feed is the parent, we might need a callback.
        // For now, let's just refresh the page or rely on the user to refresh.
        // Better: add a onDelete callback to PostCard.
        window.location.reload()
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

  const handleComment = async (e: React.FormEvent) => {
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

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/community/posts/${post._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Comment added successfully",
        })
        setComment("")
        setIsCommentOpen(false)
      }
    } catch (error) {
      console.error("Error commenting:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
            <AvatarFallback>{post.author.name ? post.author.name.charAt(0) : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{post.author.name}</span>
                {post.author.isVerified && (
                  <span className="ml-1 inline-flex items-center">
                    <svg
                      className="h-4 w-4 text-green-500 fill-current"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      />
                    </svg>
                  </span>
                )}
                <span className="text-gray-500 text-sm ml-2">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                {post.community && (
                  <Badge variant="secondary" className="hover:bg-gray-200 cursor-pointer" onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/community/${post.community!.slug}`)
                  }}>
                    c/{post.community.name}
                  </Badge>
                )}
                <Badge variant={getBadgeVariant(post.type)}>{post.type}</Badge>

                {session?.user?.id === post.author.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                        }}
                      >
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="cursor-pointer" onClick={() => router.push(`/community/post/${post._id}`)}>
                <h3 className="font-medium text-lg hover:underline">{post.title}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>

                {post.image && (
                  <div className="relative h-64 w-full overflow-hidden rounded-lg mt-2">
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                  </div>
                )}
              </div>

              {post.type === "event" && post.event && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{post.event.date}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{post.event.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{post.event.location}</span>
                  </div>
                  <Button size="sm" className="mt-2">
                    RSVP
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${post.isLiked ? "text-red-500" : ""}`} onClick={(e) => {
                    e.stopPropagation()
                    handleLike()
                  }}>
                    <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </Button>
                  <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a Comment</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleComment} className="space-y-4">
                        <Textarea
                          placeholder="Write your comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        />
                        <Button type="submit" disabled={isSubmittingComment}>
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" | null | undefined {
  switch (type) {
    case "discussion":
      return "outline"
    case "question":
      return "secondary"
    case "event":
      return "default"
    case "tip":
      return "outline"
    default:
      return "outline"
  }
}
