"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft, UserPlus, Search, Check } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ActiveMember {
    _id: string
    name: string
    expertise: string
    avatar: string
    postCount: number
    isFollowing: boolean
}

export default function MembersPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [members, setMembers] = useState<ActiveMember[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch("/api/community/active-members?limit=100")
                const data = await res.json()
                if (res.ok) {
                    setMembers(data.activeMembers)
                }
            } catch (error) {
                console.error("Error fetching members:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMembers()
    }, [session])

    const handleFollow = async (targetUserId: string, name: string) => {
        if (!session) {
            toast.error("Please login to follow users")
            router.push("/login")
            return
        }

        setActionLoading(targetUserId)
        try {
            const res = await fetch("/api/user/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId })
            })
            const data = await res.json()
            if (res.ok) {
                setMembers(prev => prev.map(m =>
                    m._id === targetUserId ? { ...m, isFollowing: data.isFollowing } : m
                ))
                toast.success(data.isFollowing ? `Following ${name}` : `Unfollowed ${name}`)
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setActionLoading(null)
        }
    }

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="container px-4 py-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/community">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-emerald-900">Community Members</h1>
                        <p className="text-gray-500">Connect with {members.length} eco-enthusiasts</p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search members..."
                        className="pl-9 ring-offset-emerald-600 focus-visible:ring-emerald-600 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                    <Card key={member._id} className="overflow-hidden hover:shadow-lg transition-all border-emerald-50">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <Link href={`/profile/${member._id}`}>
                                    <Avatar className="h-20 w-20 border-2 border-emerald-100 hover:border-emerald-500 transition-colors">
                                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                        <AvatarFallback className="text-xl bg-emerald-100 text-emerald-700">
                                            {member.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>

                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                    <Badge variant="secondary" className="mt-1 capitalize bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none">
                                        {member.expertise === 'buyer' ? 'Member' : member.expertise}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                    <span className="font-semibold text-emerald-600">{member.postCount}</span>
                                    <span>contributions</span>
                                </div>

                                <div className="flex w-full gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 text-xs h-9" asChild>
                                        <Link href={`/profile/${member._id}`}>View Profile</Link>
                                    </Button>
                                    <Button
                                        className={`flex-1 text-xs h-9 gap-2 ${member.isFollowing ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                                        onClick={() => handleFollow(member._id, member.name)}
                                        disabled={actionLoading === member._id || session?.user?.id === member._id}
                                    >
                                        {actionLoading === member._id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : member.isFollowing ? (
                                            <><Check className="h-3 w-3" /> Joined</>
                                        ) : (
                                            <><UserPlus className="h-3 w-3" /> Follow</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-12 space-y-4">
                    <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Search className="h-10 w-10 text-emerald-200" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-900">No members found</h3>
                        <p className="text-gray-500">Try adjusting your search to find who you're looking for.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
