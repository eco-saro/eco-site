// app/orders/[orderId]/page.tsx
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"

type Params = { params: { orderId: string } }

export default async function OrderPage({ params }: Params) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${params.orderId}`, {
    cache: "no-store"
  })
  const data = await res.json()

  if (!data.success) return notFound()

  const order = data.order

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Order #{order._id.slice(-6).toUpperCase()}</h1>
      <p className="text-sm text-gray-600 mb-2">
        Placed on {format(new Date(order.createdAt), "dd MMM yyyy")}
      </p>

      <div className="border rounded-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Delivery Address</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {order.shippingAddress?.street}, {order.shippingAddress?.city},<br />
          {order.shippingAddress?.state}, {order.shippingAddress?.pincode || order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
        </p>
      </div>

      {order.shiprocketAWB && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 text-emerald-800">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Courier Partner</p>
              <p className="font-medium">{order.shiprocketCourier || "Shiprocket"}</p>
            </div>
            <div>
              <p className="text-gray-600">AWB Number</p>
              <p className="font-medium">{order.shiprocketAWB}</p>
            </div>
            {order.trackingUrl && (
              <div className="md:col-span-2 mt-2">
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium underline"
                >
                  Track Shipment on Shiprocket
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border rounded-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <div className="space-y-4">
          {order.products.map((item: any) => (
            <div key={item.product?.toString() || item.productId} className="flex items-center gap-4">
              <div className="relative h-16 w-16 border bg-muted rounded">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        <div className="flex justify-between">
          <span>Status</span>
          <span className={`font-semibold ${order.status === "Delivered" ? "text-green-600" : "text-yellow-600"}`}>
            {order.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-semibold">₹{order.totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Method</span>
          <span className="text-sm">{order.paymentMethod}</span>
        </div>
      </div>
    </div>
  )
}
