"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import ShinyText from "@/components/ShinyText"

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string; // Make image optional to handle products without one
  images: string[];
  isNew?: boolean; // isNew is not part of the backend model, can be handled on frontend
}

export default function FeaturedProducts() {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const scrollSpeed = 1.5 // Increased speed for more noticeable scrolling
  const [products, setProducts] = useState<Product[]>([]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || "/placeholder.svg",
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchAllProducts();
  }, []);

  // Auto-scrolling animation with simplified approach
  useEffect(() => {
    if (!scrollRef.current) return

    let animationId: number
    let startTime: number | null = null

    const scroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      if (!isPaused && scrollRef.current) {
        // Calculate the scroll position
        const scrollContainer = scrollRef.current
        const scrollPosition = scrollContainer.scrollLeft
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth

        // If we're near the end, jump back to start (for seamless loop)
        if (scrollPosition >= maxScroll / 2) {
          scrollContainer.scrollLeft = 0
        } else {
          // Otherwise continue scrolling
          scrollContainer.scrollLeft += scrollSpeed
        }
      }

      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPaused, scrollSpeed])

  // Duplicate products array to create a seamless loop
  const duplicatedProducts = products.length > 0 ? [...products, ...products, ...products] : [];

  return (
    <section className="py-16 bg-cream-50 overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <ShinyText text="Our Best Sellers" className="text-3xl font-bold tracking-tight sm:text-4xl text-emerald-900" speed={3} />
            <p className="mt-4 text-lg text-emerald-800">Discover our most popular eco-friendly products</p>
          </div>
          <Link href="/shop">
            <Button
              variant="outline"
              className="mt-4 md:mt-0 group border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Full width scrolling container outside of the main container */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient overlays for smooth scroll effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-cream-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-cream-50 to-transparent z-10 pointer-events-none"></div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide gap-6 pb-6 px-8 no-scrollbar"
          style={{ scrollBehavior: "auto" }} // Changed to auto for smoother programmatic scrolling
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {duplicatedProducts.map((product, index) => (
            <Card
              key={`${product._id}-${index}`}
              className="overflow-hidden group flex-shrink-0 w-[280px] transition-all duration-300 hover:shadow-lg border border-emerald-200 hover:border-emerald-400 bg-white"
            >
              <Link href={`/shop/product/${product._id}`} className="block">
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {/* A simple logic for 'New' badge, can be improved */}
                  {index % 4 === 0 && <Badge className="absolute top-2 right-2 bg-emerald-600 text-white">New</Badge>}
                </div>

                <CardContent className="pt-6">
                  <div className="text-sm text-emerald-700 mb-1">{product.category}</div>
                  <h3 className="font-medium text-lg text-emerald-900">{product.name}</h3>
                  <p className="font-semibold mt-2 text-emerald-800">Rs {product.price.toFixed(2)}</p>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-emerald-100 p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                  >
                    <span>View Details</span>
                    <ArrowRight className="ml-0 h-4 w-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    <ShoppingCart className="h-4 w-2 mr-0" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
