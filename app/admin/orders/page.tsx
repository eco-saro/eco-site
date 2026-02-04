"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    Filter,
    ChevronRight,
    Truck,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink,
    Loader2,
    RefreshCw
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const fetchOrders = async (page = 1) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/orders?status=${statusFilter}&search=${searchQuery}&page=${page}`)
            const data = await response.json()
            setOrders(data.orders || [])
            setPagination(data.pagination || { total: 0, page: 1, limit: 10, pages: 1 })
        } catch (error) {
            toast.error("Failed to load orders")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders(1)
    }, [statusFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchOrders(1)
    }

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase()
        if (s === 'delivered' || s === 'completed') return <Badge className="bg-emerald-100 text-emerald-700 border-none">Delivered</Badge>
        if (s === 'processing') return <Badge className="bg-blue-100 text-blue-700 border-none">Processing</Badge>
        if (s === 'shipped') return <Badge className="bg-amber-100 text-amber-700 border-none">Shipped</Badge>
        if (s === 'cancelled') return <Badge className="bg-rose-100 text-rose-700 border-none">Cancelled</Badge>
        return <Badge variant="outline" className="text-slate-400">Pending</Badge>
    }

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase()
        if (s === 'delivered' || s === 'completed') return <CheckCircle className="h-4 w-4 text-emerald-500" />
        if (s === 'processing') return <Clock className="h-4 w-4 text-blue-500" />
        if (s === 'shipped') return <Truck className="h-4 w-4 text-amber-500" />
        if (s === 'cancelled') return <XCircle className="h-4 w-4 text-rose-500" />
        return <Package className="h-4 w-4 text-slate-400" />
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Orders</h1>
                    <p className="text-slate-500 font-medium">Monitor all marketplace activity and shipment logs</p>
                </div>
                <Button
                    variant="outline"
                    className="font-bold border-slate-200"
                    onClick={() => fetchOrders(pagination.page)}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Order ID, User, or Vendor..."
                                className="pl-10 h-12 border-slate-100 bg-slate-50 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-12 border-slate-100 bg-slate-50 font-bold">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" className="h-12 bg-slate-900 hover:bg-slate-800 font-black">
                            Filter Results
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black text-slate-900">Order Logs</CardTitle>
                        <CardDescription className="text-xs font-medium">Tracking {pagination.total} records</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="font-black text-slate-500 py-4">ORDER ID</TableHead>
                                    <TableHead className="font-black text-slate-500">DATE</TableHead>
                                    <TableHead className="font-black text-slate-500">CUSTOMER</TableHead>
                                    <TableHead className="font-black text-slate-500">VENDORS</TableHead>
                                    <TableHead className="font-black text-slate-500 text-right">TOTAL</TableHead>
                                    <TableHead className="font-black text-slate-500 text-center">STATUS</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                                <p className="text-slate-500 font-bold">Synchronizing orders...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-20 text-slate-400 italic">No orders found matching your filters.</TableCell>
                                    </TableRow>
                                ) : orders.map((order) => (
                                    <TableRow key={order._id} className="hover:bg-slate-50/50 cursor-pointer group" onClick={() => {
                                        setSelectedOrder(order)
                                        setIsDetailsOpen(true)
                                    }}>
                                        <TableCell className="font-mono font-bold text-xs uppercase">
                                            #{order._id.slice(-8)}
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs font-bold">
                                            {format(new Date(order.createdAt), "dd MMM, hh:mm a")}
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-xs font-black text-slate-800">{order.user?.name || "Guest"}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{order.user?.email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex -space-x-2">
                                                {/* Unique list of vendor names */}
                                                {Array.from(new Set(order.products.map((p: any) => p.vendor?.businessName))).slice(0, 3).map((vName: any, idx) => (
                                                    <div key={idx} className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden" title={vName}>
                                                        <span className="text-[8px] font-black pointer-events-none">{vName.charAt(0)}</span>
                                                    </div>
                                                ))}
                                                {new Set(order.products.map((p: any) => p.vendor?.businessName)).size > 3 && (
                                                    <div className="h-6 w-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-slate-400">+{new Set(order.products.map((p: any) => p.vendor?.businessName)).size - 3}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-sm">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {pagination.pages > 1 && (
                        <div className="p-4 border-t border-slate-50 flex justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => fetchOrders(pagination.page - 1)}
                            >Previous</Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === pagination.pages}
                                onClick={() => fetchOrders(pagination.page + 1)}
                            >Next</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Order Details</DialogTitle>
                        <DialogDescription className="font-mono text-xs font-bold uppercase text-emerald-600">#{selectedOrder?._id}</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="py-6 space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedOrder.status)}
                                        <span className="text-sm font-black text-slate-800">{selectedOrder.status}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                                    <span className="text-sm font-black text-slate-800">{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                    <span className="text-sm font-black text-slate-800">{format(new Date(selectedOrder.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                                </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Information</h4>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">{selectedOrder.user?.name}</p>
                                        <p className="text-sm font-medium text-slate-500">{selectedOrder.user?.email}</p>
                                        <p className="text-sm font-medium text-slate-500">{selectedOrder.shippingAddress?.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Shipping Address</h4>
                                    <div className="text-sm font-medium text-slate-500 leading-relaxed">
                                        {selectedOrder.shippingAddress?.street}<br />
                                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                                        {selectedOrder.shippingAddress?.pincode}, {selectedOrder.shippingAddress?.country}
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Items</h4>
                                <div className="border rounded-2xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="py-3 font-black text-[10px] text-slate-500">ITEM</TableHead>
                                                <TableHead className="py-3 font-black text-[10px] text-slate-500">VENDOR</TableHead>
                                                <TableHead className="py-3 font-black text-[10px] text-slate-500 text-right">PRICE</TableHead>
                                                <TableHead className="py-3 font-black text-[10px] text-slate-500 text-right">TOTAL</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.products.map((p: any, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {p.image && (
                                                                <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs font-black text-slate-800 line-clamp-1">{p.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">Qty: {p.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] font-bold border-slate-100">{p.vendor?.businessName}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-bold">₹{p.price.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-xs font-black">₹{(p.price * p.quantity).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Shipment Tracking */}
                            {selectedOrder.shiprocketOrderId && (
                                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-xl">
                                                <Truck className="h-5 w-5 text-emerald-700" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-emerald-900">Shiprocket Sync Active</h4>
                                                <p className="text-xs text-emerald-600 font-bold">System successfully exported this order</p>
                                            </div>
                                        </div>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-black h-8 text-[10px]" asChild>
                                            <a href={selectedOrder.trackingUrl || "#"} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3 w-3 mr-2" />
                                                Track Shipment
                                            </a>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-800/50 uppercase">SR Order ID</p>
                                            <p className="text-xs font-mono font-black text-emerald-900">{selectedOrder.shiprocketOrderId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-800/50 uppercase">Courier</p>
                                            <p className="text-xs font-black text-emerald-900">{selectedOrder.shiprocketCourier || "Awaiting Assignment"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
