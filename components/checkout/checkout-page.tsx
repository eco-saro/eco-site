"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, CreditCard, Landmark, Truck, Wallet } from "lucide-react"
import AuthModal from "@/components/auth-modal"
import { useToast } from "@/hooks/use-toast"
import { useRazorpay } from "@/hooks/use-razorpay"

export default function CheckoutPageClient() {
  const router = useRouter()
  const { cart, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const { displayRazorpay } = useRazorpay()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isClient, setIsClient] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Add debug info
  const addDebug = (message: string) => {
    console.log(message)
    setDebugInfo((prev) => [...prev, message])
  }

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
    addDebug("Component mounted, isClient set to true")
    addDebug(`Cart has ${cart?.length || 0} items`)
    addDebug(`User is ${user ? "logged in" : "not logged in"}`)
  }, [])

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "home",
    paymentMethod: "cod",
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (isClient && (!cart || cart.length === 0)) {
      addDebug("Cart is empty, redirecting to cart page")
      router.push("/cart")
    }
  }, [cart, router, isClient])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) errors.fullName = "Name is required"
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required"
    if (!formData.addressLine1.trim()) errors.addressLine1 = "Address is required"
    if (!formData.city.trim()) errors.city = "City is required"
    if (!formData.state.trim()) errors.state = "State is required"
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required"
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = "Enter a valid 6-digit pincode"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsProcessing(true)
    addDebug(`Processing ${formData.paymentMethod} order...`)

    try {
      if (formData.paymentMethod === "cod") {
        // COD Flow
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart,
            totalAmount: totalPrice(),
            shippingAddress: {
              name: formData.fullName,
              phone: formData.phoneNumber,
              street: `${formData.addressLine1} ${formData.addressLine2}`.trim(),
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: "India",
            },
            paymentMethod: "COD",
          }),
        })

        const data = await res.json()
        if (data.success) {
          clearCart()
          router.push(`/order-confirmation?orderId=${data.orderId}`)
        } else {
          throw new Error(data.message || "Failed to place order")
        }
      } else {
        // Razorpay Flow
        const orderRes = await fetch("/api/payment/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice(),
            currency: "INR",
          }),
        })

        const razorpayOrder = await orderRes.json()

        displayRazorpay(
          {
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            order_id: razorpayOrder.id,
            prefill: {
              name: formData.fullName,
              email: user.email || "",
              contact: formData.phoneNumber,
            },
          },
          async (response) => {
            addDebug("Razorpay payment successful, verifying...")
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                items: cart,
                totalAmount: totalPrice(),
                shippingAddress: {
                  name: formData.fullName,
                  phone: formData.phoneNumber,
                  street: `${formData.addressLine1} ${formData.addressLine2}`.trim(),
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  country: "India",
                },
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              clearCart()
              router.push(`/order-confirmation?orderId=${verifyData.orderId}`)
            } else {
              toast({
                title: "Verification Failed",
                description: verifyData.message || "Failed to verify payment",
                variant: "destructive",
              })
            }
          }
        )
      }
    } catch (error: any) {
      console.error("Order error:", error)
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery"
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

  // Don't render anything on the server
  if (!isClient) {
    return null
  }

  return (
    <div className="container px-4 py-10 mx-auto">
      <div className="mb-6">
        <Link href="/cart" className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

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

            <div className="mt-4">
              <Label className="mb-2 block">Address Type</Label>
              <RadioGroup
                value={formData.addressType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, addressType: value }))}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home" className="cursor-pointer">
                    Home
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work" id="work" />
                  <Label htmlFor="work" className="cursor-pointer">
                    Work
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex items-center cursor-pointer w-full">
                  <Wallet className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center cursor-pointer w-full">
                  <CreditCard className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Credit/Debit Card</span>
                    <p className="text-sm text-gray-500">Secure payment via Stripe/Razorpay</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center cursor-pointer w-full">
                  <Wallet className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">UPI</span>
                    <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Label htmlFor="netbanking" className="flex items-center cursor-pointer w-full">
                  <Landmark className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Net Banking</span>
                    <p className="text-sm text-gray-500">All major banks supported</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="line-clamp-1">{item.name}</h3>
                        <p className="ml-4">₹{item.price * item.quantity}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.category}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <p className="text-gray-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>₹{totalPrice()}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <p>Taxes</p>
                <p>Calculated at checkout</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
              <p>Total</p>
              <p>₹{totalPrice()}</p>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg" onClick={handlePlaceOrder} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                <>
                  Place Order <Truck className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                By placing this order, you agree to EcoSaro's <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </div>

            {/* Debug info section - only visible in development */}
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
              <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <p className="font-bold mb-2">Debug Info:</p>
                {debugInfo.map((info, i) => (
                  <div key={i} className="mb-1 border-b border-gray-200 pb-1">{info}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} onSuccess={() => setIsAuthModalOpen(false)} />
    </div>
  )
}