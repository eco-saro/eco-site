"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface TrendingTopic {
    title: string
    category: string
    posts: number
    views: number
    id: string
}

export default function TrendingPage() {
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch("/api/community/trending?limit=50")
                const data = await res.json()
                if (res.ok) {
                    setTrendingTopics(data.trendingTopics)
                }
            } catch (error) {
                console.error("Error fetching trending topics:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTrending()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container px-4 py-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/community">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">All Trending Topics</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingTopics.map((topic) => (
                    <Link key={topic.id} href={`/community/post/${topic.id}`}>
                        <Card className="hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer group h-full">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none">
                                            {topic.category}
                                        </Badge>
                                        <h3 className="text-xl font-semibold group-hover:text-emerald-700 transition-colors">
                                            {topic.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{topic.posts} posts</span>
                                            <span>•</span>
                                            <span>{topic.views} views</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-full shadow-sm group-hover:bg-emerald-50 transition-colors">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-emerald-600"
                                        >
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
