"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react"
import ShinyText from "@/components/ShinyText"
import CardSwap, { Card as SwapCard } from "@/components/ui/card-swap"

// Mock community posts data
const communityPosts = [
  {
    id: "1",
    title: "My urban garden transformation",
    excerpt: "I transformed my small balcony into a thriving urban garden. Here's how I did it...",
    image: "/balcony.jpg",
    author: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg",
      initials: "PS",
    },
    likes: 128,
    comments: 32,
    shares: 14,
  },
  {
    id: "2",
    title: "DIY compost bin from recycled materials",
    excerpt: "Check out my weekend project - a compost bin made entirely from recycled materials!",
    image: "/DIY-compost-bin-ideas.jpg",
    author: {
      name: "Rahul Patel",
      avatar: "/placeholder.svg",
      initials: "RP",
    },
    likes: 95,
    comments: 27,
    shares: 8,
  },
  {
    id: "3",
    title: "Harvested my first batch of organic tomatoes",
    excerpt: "After months of care, I finally harvested my first batch of organic tomatoes. The taste is incredible!",
    image: "/tomato harvest.jpg",
    author: {
      name: "Ananya Gupta",
      avatar: "/placeholder.svg",
      initials: "AG",
    },
    likes: 156,
    comments: 41,
    shares: 22,
  },
]

export default function Community() {
  const router = useRouter()

  const handleJoinCommunity = () => {
    router.push("/community")
  }

  const handleViewPost = (postId: string) => {
    router.push(`/community/post/${postId}`)
  }

  return (
    <section className="py-20 md:py-32 bg-[#FDFBF7] overflow-hidden min-h-screen">
      <div className="container px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column: Text Content */}
          <div className="relative z-20 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto lg:mx-0"
            >
              <h2 className="text-5xl md:text-[64px] font-bold tracking-tighter text-[#1A4D2E] leading-[0.9] mb-6 md:mb-8">
                Community <br />
                <span className="italic font-light text-gray-400">Highlights</span>
              </h2>
              <p className="hidden md:block text-lg md:text-xl text-gray-600 font-medium mb-8 md:mb-12 leading-relaxed">
                Join our growing community of eco-enthusiasts sharing their sustainable living journeys. Discover how others are making a difference.
              </p>
              <Button
                className="bg-[#1A4D2E] hover:bg-[#143d24] text-white px-8 md:px-10 h-14 md:h-16 rounded-full text-base md:text-lg font-bold transition-all shadow-lg hover:shadow-xl w-full md:w-auto"
                onClick={handleJoinCommunity}
              >
                Join The Community
              </Button>
            </motion.div>
          </div>

          {/* Right Column: CardSwap Area */}
          <div className="relative h-[500px] md:h-[650px] flex items-center justify-center lg:justify-end mt-48 md:mt-32 lg:mt-0">
            <div className="relative w-full h-full flex items-center justify-center translate-x-16 md:translate-x-0">
              <CardSwap
                width={typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 400}
                height={typeof window !== 'undefined' && window.innerWidth < 768 ? 420 : 520}
                cardDistance={typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 60}
                verticalDistance={typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 50}
                delay={4500}
                pauseOnHover={true}
                skewAmount={2}
              >
                {communityPosts.map((post) => (
                  <SwapCard
                    key={post.id}
                    customClass="overflow-hidden border-none shadow-[20px_40px_80px_rgba(0,0,0,0.08)] bg-white rounded-3xl"
                  >
                    <div className="flex flex-col h-full bg-white">
                      <div className="relative h-[65%] w-full">
                        <Image
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="p-8 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center mb-4">
                            <Avatar className="h-10 w-10 mr-3 border-2 border-emerald-50 shadow-sm">
                              <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                              <AvatarFallback>{post.author.initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-gray-800 tracking-tight">{post.author.name}</span>
                          </div>

                          <h3 className="font-bold text-2xl text-[#1A4D2E] leading-tight mb-3">
                            {post.title}
                          </h3>
                        </div>

                        <div className="flex justify-between items-center text-[#1A4D2E]/60 text-sm font-bold mt-4">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                              <ThumbsUp className="h-5 w-5" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-5 w-5" />
                              <span>{post.comments}</span>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            className="text-[#1A4D2E] p-0 font-black uppercase tracking-widest text-xs"
                            onClick={() => handleViewPost(post.id)}
                          >
                            View Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SwapCard>
                ))}
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
