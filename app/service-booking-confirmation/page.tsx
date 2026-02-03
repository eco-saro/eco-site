"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { CheckCircle2, CalendarDays, MapPin, Clock, ArrowLeft } from "lucide-react"

interface ServiceBooking {
  id: string
  date: string
  service: {
    id: string
    name: string
    description: string
    price: number
    image: string
    duration: string
    category: string
  }
  serviceDate: string
  serviceTime: string
  totalAmount: number
  clientInfo: {
    fullName: string
    phoneNumber: string
    email: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
  }
  additionalNotes: string
  paymentMethod: string
  status: string
}

// Client component that uses useSearchParams
function BookingContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<ServiceBooking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to retrieve booking from localStorage
    if (typeof window !== "undefined" && bookingId) {
      try {
        const storedBookings = JSON.parse(localStorage.getItem("ecoSaroServiceBookings") || "[]")
        const foundBooking = storedBookings.find((b: ServiceBooking) => b.id === bookingId)
        setBooking(foundBooking || null)
      } catch (error) {
        console.error("Error retrieving booking:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="container py-12 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="animate-pulse h-8 w-60 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="animate-pulse h-4 w-40 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container py-12 max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the booking you're looking for.</p>
          <Link href="/services">
            <Button>Return to Services</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Format the dates for display
  const formattedBookingDate = new Date(booking.date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedServiceDate = new Date(booking.serviceDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod":
        return "Pay at Service"
      case "card":
        return "Credit/Debit Card"
      case "upi":
        return "UPI"
      case "netbanking":
        return "Net Banking"
      default:
        return method
    }
  }

  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/services" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Services
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your booking has been successfully placed.</p>
          <p className="font-medium mt-2">Booking ID: {booking.id}</p>
          <p className="text-sm text-gray-500">Placed on {formattedBookingDate}</p>
        </div>

        <Separator className="my-6" />

        <div className="space-y-8">
          {/* Service Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Service Details</h2>
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={booking.service.image || "/placeholder.svg"}
                  alt={booking.service.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{booking.service.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{booking.service.category}</p>
                <p className="font-medium text-emerald-600">₹{booking.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Schedule Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start">
                <CalendarDays className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Service Date</p>
                  <p className="text-gray-600">{formattedServiceDate}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Service Time</p>
                  <p className="text-gray-600">{booking.serviceTime}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Service Location</p>
                  <p className="text-gray-600">
                    {booking.clientInfo.addressLine1}
                    {booking.clientInfo.addressLine2 && `, ${booking.clientInfo.addressLine2}`},
                    <br />
                    {booking.clientInfo.city}, {booking.clientInfo.state}, {booking.clientInfo.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>₹{booking.service.price}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{booking.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-600">Payment Method</span>
                <span>{getPaymentMethodLabel(booking.paymentMethod)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Our service professional will reach out to you 24 hours before the scheduled time to confirm the appointment.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button variant="outline">Browse More Services</Button>
            </Link>
            <Link href="/account/service-bookings">
              <Button>View Your Bookings</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary
export default function ServiceBookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container py-12 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="animate-pulse h-8 w-60 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="animate-pulse h-4 w-40 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
