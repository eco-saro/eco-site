// app/orders/page.tsx
import db from "@/lib/mongodb"
import { Order } from "@/models/order"
import { format } from "date-fns"

export default async function OrdersPage() {
  await db()

  const orders = await Order.find().sort({ createdAt: -1 }).lean()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order._id.toString()}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between mb-2">
                <div>
                  <h2 className="font-semibold">Order ID: {order._id.toString()}</h2>
                  <p className="text-sm text-gray-600">
                    Placed on {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <div>
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="font-medium">Shipping Address</h3>
                <p className="text-sm text-gray-700">
                  {order.shippingAddress?.name}, {order.shippingAddress?.phone}<br />
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}, {order.shippingAddress?.country}
                </p>
              </div>

              <div className="mb-2">
                <h3 className="font-medium">Items</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5">
                  {order.products?.map((item: any, index: number) => (
                    <li key={index}>
                      {item.name} x {item.quantity} — ₹{item.price * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between mt-4">
                <span className="font-semibold">Total: ₹{order.totalAmount}</span>
                <span className="text-sm text-gray-600">Payment: {order.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
