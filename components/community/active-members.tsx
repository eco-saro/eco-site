"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface ActiveMember {
  _id: string
  name: string
  expertise: string
  avatar: string
  postCount: number
}

export default function ActiveMembers() {
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveMembers = async () => {
      try {
        const res = await fetch("/api/community/active-members")
        const data = await res.json()
        if (res.ok) {
          setActiveMembers(data.activeMembers)
        }
      } catch (error) {
        console.error("Error fetching active members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveMembers()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Active Members</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Active Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeMembers.length > 0 ? (
          activeMembers.map((member) => (
            <div key={member._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.postCount} posts</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Follow
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            No active members yet.
          </div>
        )}
        <Link href="/community/members">
          <Button variant="outline" className="w-full">
            View All Members
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}


