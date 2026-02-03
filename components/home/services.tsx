"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import ShinyText from "@/components/ShinyText"

// Mock services data
const services = [
  {
    id: "1",
    name: "Organic Pest Control",
    description: "Eco-friendly pest management solutions using natural ingredients.",
    image: "/pestcntrl.webp?height=400&width=400",
    price: "Starting at Rs 49",
  },
  {
    id: "2",
    name: "Garden Setup & Maintenance",
    description: "Professional gardening services to create and maintain your green space.",
    image: "/plants.jpg?height=400&width=400",
    price: "Starting at Rs 99",
  },
  {
    id: "3",
    name: "Sustainable Landscaping",
    description: "Transform your outdoor space with sustainable landscaping solutions.",
    image: "/green service.jpg?height=400&width=400",
    price: "Starting at Rs 199",
  },
]

export default function Services() {
  const router = useRouter()

  const handleBookService = () => {
    router.push("/checkout")
  }

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <ShinyText text="Our Services" className="text-3xl font-bold tracking-tight text-emerald-900 sm:text-4xl" speed={3} />
            <p className="mt-4 text-lg text-gray-600">Professional eco-friendly services for your home and garden</p>
          </div>
          <Link href="/services">
            <Button variant="outline" className="mt-4 md:mt-0">
              View All Services
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden h-full group">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <CardContent className="pt-6 flex-grow">
                <ShinyText text={service.name} className="font-medium text-lg" speed={3} />
                <p className="mt-2 text-gray-600">{service.description}</p>
                <p className="font-semibold mt-4 text-primary">{service.price}</p>
              </CardContent>

              <CardFooter className="border-t p-4">
                <Button className="w-full" onClick={handleBookService}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
