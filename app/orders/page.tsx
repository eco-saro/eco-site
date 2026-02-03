import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import db from "@/lib/mongodb"
import { Order } from "@/models/order.model"
import { format } from "date-fns"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Package, Truck, Clock, CheckCircle2, ShoppingBag, ChevronRight, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  await db()

  const userId = (session.user as any).id
  const filter = (session.user as any).role === "admin" ? {} : { user: userId }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed': return 'text-green-600 bg-green-50 border-green-100'
      case 'processing': return 'text-amber-600 bg-amber-50 border-amber-100'
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-100'
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-100'
      default: return 'text-gray-600 bg-gray-50 border-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">My Orders</h1>
            <p className="text-slate-500 font-medium">Manage and track your recent purchases</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all hover:shadow-lg active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't made any purchases yet. Start shopping to see your orders here!</p>
            <Link
              href="/shop"
              className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              Browse our shop <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order: any) => (
              <div
                key={order._id.toString()}
                className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Order Header */}
                <div className="bg-slate-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
                      <p className="text-sm font-semibold text-slate-700">{format(new Date(order.createdAt), "dd MMM yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="text-sm font-mono font-semibold text-slate-700">#{order._id.toString().slice(-8).toUpperCase()}</p>
                    </div>
                    {order.shiprocketOrderId && (
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Shiprocket ID</p>
                        <p className="text-sm font-mono font-semibold text-slate-500">#{order.shiprocketOrderId}</p>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {(order.status === 'delivered' || order.status === 'completed') ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {order.status}
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Products List */}
                    <div className="lg:col-span-2 space-y-4">
                      {order.products?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/50">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                              <span className="text-sm font-semibold text-emerald-600">Rs {item.price}</span>
                            </div>
                          </div>
                          <Link
                            href={`/shop/product/${item.product}`}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Order Details Sidebar */}
                    <div className="lg:border-l lg:border-slate-100 lg:pl-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                          <div className="text-sm">
                            <p className="font-bold text-slate-900 mb-1">Delivery Address</p>
                            <p className="text-slate-500 leading-relaxed font-medium">
                              {order.shippingAddress?.name}<br />
                              {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <CreditCard className="w-4 h-4 text-slate-400 mt-1" />
                          <div className="text-sm">
                            <p className="font-bold text-slate-900 mb-1">Payment Info</p>
                            <p className="text-slate-500 font-medium">Method: {order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Total Paid</p>
                            <p className="text-2xl font-black text-emerald-700">Rs {order.totalAmount}</p>
                          </div>
                          <Package className="w-8 h-8 text-emerald-200" />
                        </div>
                      </div>

                      {(order.trackingUrl || order.shiprocketShipmentId) && (
                        <a
                          href={order.trackingUrl || `https://shiprocket.co/tracking/${order.shiprocketShipmentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
                        >
                          <Truck className="w-4 h-4" />
                          Track Order
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
