"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, MessageSquare, Users, UserPlus, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface PublicProfile {
    user: {
        _id: string
        name: string
        image: string
        role: string
        bio?: string
        createdAt: string
    }
    stats: {
        postCount: number
        followerCount: number
        followingCount: number
    }
    recentPosts: any[]
}

export default function PublicProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/user/profile/${params.id}`)
                const data = await res.json()
                if (res.ok) {
                    setProfile(data)
                    // Check if current user is following this profile
                    const currentUserId = session?.user?.id
                    if (currentUserId && data.user.followers) {
                        setIsFollowing(data.user.followers.includes(currentUserId))
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) fetchProfile()
    }, [params.id, session])

    const handleFollow = async () => {
        if (!session) {
            toast.error("Please login to follow users")
            router.push("/login")
            return
        }

        setFollowLoading(true)
        try {
            const res = await fetch("/api/user/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: params.id })
            })
            const data = await res.json()
            if (res.ok) {
                setIsFollowing(data.isFollowing)
                // Update follower count in local state
                if (profile) {
                    setProfile({
                        ...profile,
                        stats: {
                            ...profile.stats,
                            followerCount: data.followerCount
                        }
                    })
                }
                toast.success(data.isFollowing ? `Following ${profile?.user.name}` : `Unfollowed ${profile?.user.name}`)
            }
        } catch (error) {
            toast.error("Failed to update follow status")
        } finally {
            setFollowLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold">User not found</h1>
                <Link href="/community/members">
                    <Button variant="link" className="mt-4">Back to Community</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="bg-white border-b">
                <div className="container max-w-5xl px-4 py-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/community/members">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                            <AvatarImage src={profile.user.image} alt={profile.user.name} />
                            <AvatarFallback className="text-3xl bg-emerald-100 text-emerald-700">
                                {profile.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900">{profile.user.name}</h1>
                                    <Badge variant="secondary" className="mt-2 text-sm px-3">
                                        {profile.user.role === 'buyer' ? 'Community Member' : profile.user.role}
                                    </Badge>
                                </div>

                                {session?.user?.id !== profile.user._id && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            variant={isFollowing ? "outline" : "default"}
                                            className={!isFollowing ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                        >
                                            {followLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    {isFollowing ? 'Joined' : 'Follow'}
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="outline">Message</Button>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                                {profile.user.bio || "This user hasn't added a bio yet. Sustainability enthusiast and community contributor."}
                            </p>

                            <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-900">{profile.stats.postCount}</span>
                                    <span className="text-sm text-gray-500 font-medium">Posts</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-900">{profile.stats.followerCount}</span>
                                    <span className="text-sm text-gray-500 font-medium">Followers</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-900">{profile.stats.followingCount}</span>
                                    <span className="text-sm text-gray-500 font-medium">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Posts</h2>
                    {profile.recentPosts.length > 0 ? (
                        profile.recentPosts.map((post: any) => (
                            <Card key={post._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <Link href={`/community/post/${post._id}`}>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="capitalize">{post.type}</Badge>
                                                <span className="text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold group-hover:text-emerald-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 line-clamp-2">{post.content}</p>
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No posts yet</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-emerald-600" />
                                <span>Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <MessageSquare className="h-4 w-4 text-emerald-600" />
                                <span>{profile.stats.postCount} Discussions</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Users className="h-4 w-4 text-emerald-600" />
                                <span>{profile.stats.followerCount} Active Followers</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
