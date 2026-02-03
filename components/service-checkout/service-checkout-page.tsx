"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Separator } from "../../components/ui/separator"
import {
  CalendarDays,
  ChevronLeft,
  CreditCard,
  Landmark,
  Truck,
  Wallet,
  Clock
} from "lucide-react"
import { useAuth } from "../../components/auth-provider"
import AuthModal from "../../components/auth-modal"
import { useToast } from "../../hooks/use-toast"
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select"

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  category: string;
}

export default function ServiceCheckoutPageClient() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Get service data from localStorage or query params
  const [service, setService] = useState<Service | null>(null)

  // Form data specific for service booking
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    serviceDate: "",
    serviceTime: "",
    additionalNotes: "",
    paymentMethod: "cod",
  })

  // Add debug info
  const addDebug = (message: string) => {
    console.log(message)
    setDebugInfo((prev) => [...prev, message])
  }

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
    addDebug("Component mounted, isClient set to true")
    addDebug(`User is ${user ? "logged in" : "not logged in"}`)

    // Try to get service from localStorage
    if (typeof window !== "undefined") {
      const storedService = localStorage.getItem("selectedService")
      if (storedService) {
        try {
          const parsedService = JSON.parse(storedService)
          setService(parsedService)
          addDebug(`Service loaded from storage: ${parsedService.name}`)
        } catch (error) {
          console.error("Error parsing service data:", error)
          addDebug(`Error loading service: ${error}`)
        }
      } else {
        addDebug("No service found in storage")
      }
    }
  }, [])

  // Redirect if no service is selected
  useEffect(() => {
    if (isClient && !service) {
      addDebug("No service selected, redirecting to services page")
      router.push("/services")
    }
  }, [service, router, isClient])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) errors.fullName = "Name is required"
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required"
    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Enter a valid email address"
    if (!formData.addressLine1.trim()) errors.addressLine1 = "Address is required"
    if (!formData.city.trim()) errors.city = "City is required"
    if (!formData.state.trim()) errors.state = "State is required"
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required"
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = "Enter a valid 6-digit pincode"
    if (!formData.serviceDate.trim()) errors.serviceDate = "Service date is required"
    if (!formData.serviceTime.trim()) errors.serviceTime = "Service time is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleBookService = () => {
    addDebug("Book service button clicked")

    // Check if user is logged in
    if (!user) {
      addDebug("User not logged in, showing auth modal")
      setIsAuthModalOpen(true)
      return
    }

    // Check if service is selected
    if (!service) {
      addDebug("No service selected")
      toast({
        title: "No service selected",
        description: "Please select a service before booking.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!validateForm()) {
      addDebug("Form validation failed")
      Object.entries(formErrors).forEach(([field, error]) => {
        addDebug(`Validation error: ${field} - ${error}`)
      })

      toast({
        title: "Please check your information",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      })
      return
    }

    try {
      addDebug("Processing service booking...")
      setIsProcessing(true)

      // Create booking object
      const bookingId = `ECO-SRV-${Math.floor(100000 + Math.random() * 900000)}`
      addDebug(`Generated booking ID: ${bookingId}`)

      const booking = {
        id: bookingId,
        date: new Date().toISOString(),
        service: service,
        serviceDate: formData.serviceDate,
        serviceTime: formData.serviceTime,
        totalAmount: service.price,
        clientInfo: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        additionalNotes: formData.additionalNotes,
        paymentMethod: formData.paymentMethod,
        status: "confirmed",
      }

      addDebug("Booking object created")

      // Save booking to localStorage (in a real app, this would be an API call)
      if (typeof window !== "undefined") {
        try {
          addDebug("Saving booking to localStorage")
          const existingBookings = JSON.parse(localStorage.getItem("ecoSaroServiceBookings") || "[]")
          localStorage.setItem("ecoSaroServiceBookings", JSON.stringify([booking, ...existingBookings]))
          addDebug("Booking saved to localStorage successfully")

          // Clear the selected service
          localStorage.removeItem("selectedService")
        } catch (storageError) {
          console.error("Error saving to localStorage:", storageError)
          addDebug(`Error saving to localStorage: ${storageError}`)
          toast({
            title: "Error saving booking",
            description: "There was a problem saving your booking. Please try again.",
            variant: "destructive",
          })
          setIsProcessing(false)
          return
        }
      }

      // Show success toast
      toast({
        title: "Service booked successfully!",
        description: "Thank you for booking with us.",
      })

      // Redirect to booking confirmation page
      addDebug(`Redirecting to booking confirmation page with bookingId: ${bookingId}`)
      setTimeout(() => {
        router.push(`/service-booking-confirmation?bookingId=${bookingId}`)
      }, 1000)
    } catch (error) {
      console.error("Error booking service:", error)
      addDebug(`Error booking service: ${error}`)
      toast({
        title: "Error booking service",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cod":
        return <Wallet className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "upi":
        return <Wallet className="h-4 w-4" />
      case "netbanking":
        return <Landmark className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  // Available time slots
  const timeSlots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM"
  ]

  // Don't render anything on the server
  if (!isClient) {
    return null
  }

  return (
    <div className="container px-4 py-10 mx-auto">
      <div className="mb-6">
        <Link href="/services" className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Services
        </Link>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">Service Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={formErrors.fullName ? "border-red-500" : ""}
                />
                {formErrors.fullName && <p className="text-red-500 text-sm">{formErrors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={formErrors.phoneNumber ? "border-red-500" : ""}
                />
                {formErrors.phoneNumber && <p className="text-red-500 text-sm">{formErrors.phoneNumber}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
            </div>
          </div>

          {/* Service Address */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Service Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine1">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className={formErrors.addressLine1 ? "border-red-500" : ""}
                />
                {formErrors.addressLine1 && <p className="text-red-500 text-sm">{formErrors.addressLine1}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={formErrors.city ? "border-red-500" : ""}
                />
                {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={formErrors.state ? "border-red-500" : ""}
                />
                {formErrors.state && <p className="text-red-500 text-sm">{formErrors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={formErrors.pincode ? "border-red-500" : ""}
                />
                {formErrors.pincode && <p className="text-red-500 text-sm">{formErrors.pincode}</p>}
              </div>
            </div>
          </div>

          {/* Service Schedule */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Service Schedule</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceDate">
                  Preferred Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="serviceDate"
                    name="serviceDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.serviceDate}
                    onChange={handleInputChange}
                    className={formErrors.serviceDate ? "border-red-500" : ""}
                  />
                  <CalendarDays className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {formErrors.serviceDate && <p className="text-red-500 text-sm">{formErrors.serviceDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceTime">
                  Preferred Time Slot <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Select
                    value={formData.serviceTime}
                    onValueChange={(value) => handleSelectChange("serviceTime", value)}
                  >
                    <SelectTrigger className={formErrors.serviceTime ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Clock className="absolute right-8 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {formErrors.serviceTime && <p className="text-red-500 text-sm">{formErrors.serviceTime}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  placeholder="Any specific requirements or instructions for the service..."
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              className="space-y-3"
            >
              {["cod", "card", "upi", "netbanking"].map((method) => (
                <div
                  key={method}
                  className="flex items-center space-x-3 border rounded-md p-3 cursor-pointer hover:bg-muted/50"
                >
                  <RadioGroupItem value={method} id={`payment-${method}`} />
                  <Label htmlFor={`payment-${method}`} className="flex items-center cursor-pointer w-full">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                      {getPaymentMethodIcon(method)}
                    </div>
                    <span>{getPaymentMethodLabel(method)}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Service Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Service Summary</h2>

            {service ? (
              <div className="space-y-4 mb-4">
                <div className="flex gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.duration}</p>
                    <p className="font-medium text-emerald-600">₹{service.price}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No service selected</p>
            )}

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>₹{service?.price || 0}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>₹{service ? service.price : 0}</span>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              onClick={handleBookService}
              disabled={isProcessing || !service}
            >
              {isProcessing ? "Processing..." : "BOOK SERVICE"}
            </Button>

            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              Services available Mon-Sat
            </div>
          </div>
        </div>
      </div>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === "development" && debugInfo.length > 0 && (
        <div className="mt-8 p-4 border border-gray-300 rounded-md bg-gray-50">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <ul className="text-xs space-y-1">
            {debugInfo.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
        </div>
      )}

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={(open) => setIsAuthModalOpen(open)}
        onSuccess={() => {
          // After successful login, try booking service again
          setTimeout(() => handleBookService(), 500)
        }}
      />
    </div>
  )
}
