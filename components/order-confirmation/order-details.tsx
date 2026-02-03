"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Steps, Step } from "@/components/ui/steps"
import { CheckCircle, Package, Truck, Home, ArrowLeft, ShoppingBag } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: string
  date: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: {
    fullName: string
    phoneNumber: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    addressType: string
  }
  paymentMethod: string
  status: string
}

export default function OrderDetails() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found")
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) {
          throw new Error("Order not found")
        }
        const data = await response.json()

        // Map backend Order to frontend Order type
        const mappedOrder: Order = {
          id: data._id,
          date: data.createdAt,
          items: data.products.map((p: any) => ({
            id: p.product?._id || p.product,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            image: p.image
          })),
          totalAmount: data.totalAmount,
          shippingAddress: {
            fullName: data.shippingAddress.name,
            phoneNumber: data.shippingAddress.phone,
            addressLine1: data.shippingAddress.street,
            city: data.shippingAddress.city,
            state: data.shippingAddress.state,
            pincode: data.shippingAddress.pincode,
            addressType: "Default", // API doesn't have addressType yet
          },
          paymentMethod: data.paymentMethod.toLowerCase(),
          status: data.status
        }

        setOrder(mappedOrder)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading order details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || "Unable to load order details"}</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPaymentMethodName = (method: string) => {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Order #{order.id}</span>
              <span className="text-sm font-normal text-muted-foreground">Placed on {formatDate(order.date)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Steps className="mb-8">
              <Step
                label="Order Placed"
                status="complete"
              >
                <CheckCircle className="h-4 w-4" />
              </Step>
              <Step
                label="Processing"
                status="current"
              >
                <Package className="h-4 w-4" />
              </Step>
              <Step
                label="Shipped"
                status="incomplete"
              >
                <Truck className="h-4 w-4" />
              </Step>
              <Step
                label="Delivered"
                status="incomplete"
              >
                <Home className="h-4 w-4" />
              </Step>
            </Steps>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  <p className="mt-1">Phone: {order.shippingAddress.phoneNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="text-sm">
                  <p>Method: {getPaymentMethodName(order.paymentMethod)}</p>
                  <p>Status: Paid</p>
                  <p className="mt-1">Total: ₹{order.totalAmount}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2">
                <span>Total Amount Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/shop" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild>
            <Link href="/orders" className="flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View All Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
