"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface TrendingTopic {
  title: string
  category: string
  posts: number
  views: number
  id: string
}

export default function TrendingTopics() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/community/trending")
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
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Trending Topics</h2>
        <Link href="/community/trending">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start mb-4 overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Discussion">Discussions</TabsTrigger>
          <TabsTrigger value="Tip">Tips</TabsTrigger>
          <TabsTrigger value="Question">Questions</TabsTrigger>
          <TabsTrigger value="Event">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Discussion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics
              .filter((topic) => topic.category === "Discussion")
              .map((topic) => (
                <TopicCard key={topic.id} {...topic} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="Tip" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics
              .filter((topic) => topic.category === "Tip")
              .map((topic) => (
                <TopicCard key={topic.id} {...topic} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="Question" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics
              .filter((topic) => topic.category === "Question")
              .map((topic) => (
                <TopicCard key={topic.id} {...topic} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="Event" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics
              .filter((topic) => topic.category === "Event")
              .map((topic) => (
                <TopicCard key={topic.id} {...topic} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TopicCard({ title, category, posts, views }) {
  return (
    <div className="border rounded-lg p-4 hover:border-green-200 hover:bg-green-50/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant="outline" className="mb-2">
            {category}
          </Badge>
          <h3 className="font-medium mb-1">{title}</h3>
          <div className="text-sm text-gray-500">
            {posts} posts • {views} views
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>
    </div>
  )
}


