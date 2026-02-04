"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    DollarSign,
    Filter,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    ArrowRightLeft,
    ChevronDown,
    MoreVertical,
    CheckSquare,
    Square,
    Landmark,
    Download
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminPayoutsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>}>
            <PayoutsContent />
        </Suspense>
    )
}

function PayoutsContent() {
    const searchParams = useSearchParams()
    const vendorIdFromQuery = searchParams.get("vendorId")

    const [vendors, setVendors] = useState<any[]>([])
    const [selectedVendor, setSelectedVendor] = useState(vendorIdFromQuery || "")
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [payoutData, setPayoutData] = useState<any>(null)
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [transactionRef, setTransactionRef] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // Sync selectedVendor with URL param if it changes externally
    useEffect(() => {
        if (vendorIdFromQuery) {
            setSelectedVendor(vendorIdFromQuery)
        }
    }, [vendorIdFromQuery])

    // Fetch Vendors
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch("/api/admin/payouts")
                const result = await response.json()
                if (result.vendors) {
                    setVendors(result.vendors)
                }
            } catch (error) {
                toast.error("Failed to load vendors")
            } finally {
                setIsInitialLoading(false)
            }
        }
        fetchVendors()
    }, [])

    // Fetch Payout Data
    const fetchData = async () => {
        if (!selectedVendor) return
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/payouts?vendorId=${selectedVendor}&startDate=${startDate}&endDate=${endDate}`)
            const result = await response.json()
            setPayoutData(result)
            setSelectedItems([])
        } catch (error) {
            toast.error("Failed to fetch payout data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (selectedVendor) {
            fetchData()
        }
    }, [selectedVendor, startDate, endDate])

    const toggleItemSelection = (item: any) => {
        if (item.status === 'COMPLETED' || item.isLocked || item.isRefunded) return;

        setSelectedItems(prev => {
            const exists = prev.find(p => p.orderId === item.orderId && p.productName === item.productName);
            if (exists) {
                return prev.filter(p => !(p.orderId === item.orderId && p.productName === item.productName));
            } else {
                return [...prev, item];
            }
        })
    }

    const handleMarkAsPaid = async () => {
        if (!transactionRef) {
            toast.error("Please enter a transaction reference")
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch("/api/admin/payouts/mark-paid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderItems: selectedItems,
                    transactionReference: transactionRef,
                    payoutDate: new Date()
                })
            })

            const result = await response.json()
            if (result.success) {
                toast.success(result.message)
                setIsPayModalOpen(false)
                setTransactionRef("")
                fetchData()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Settlement failed")
        } finally {
            setIsProcessing(false)
        }
    }

    const exportToCSV = () => {
        if (!payoutData?.items?.length) return;

        const headers = ["Order ID", "Product", "Price", "Qty", "Gross", "Commission", "Net Payable", "Status"];
        const rows = payoutData.items.map((item: any) => [
            item.orderId,
            `"${item.productName.replaceAll(/"/g, '""')}"`,
            item.price,
            item.quantity,
            item.total,
            item.commission,
            item.net,
            item.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `payout-report-${payoutData.vendor?.name || 'vendor'}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("CSV Report exported successfully");
    }

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    const metrics = payoutData?.metrics || { grossSales: 0, totalCommission: 0, totalRefunds: 0, amountToPay: 0, totalOrders: 0 }
    const items = payoutData?.items || []

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Payouts</h1>
                    <p className="text-slate-500 font-medium">Review and settle payments for ecosystem partners</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        className="font-bold border-slate-200"
                        onClick={exportToCSV}
                        disabled={!payoutData || payoutData.items.length === 0}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Report
                    </Button>
                    {selectedItems.length > 0 && (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/20"
                            onClick={() => setIsPayModalOpen(true)}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Settle {selectedItems.length} items
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Vendor</label>
                            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                <SelectTrigger className="h-12 border-slate-100 bg-slate-50 font-bold">
                                    <SelectValue placeholder="Chose a vendor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.map(v => (
                                        <SelectItem key={v._id} value={v._id}>{v.businessName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-12 border-slate-100 bg-slate-50 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-12 border-slate-100 bg-slate-50 font-bold"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!selectedVendor ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="h-16 w-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                        <Filter className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-700">No Vendor Selected</h3>
                    <p className="text-slate-500 font-medium">Please select a vendor from the dropdown above to view payout details.</p>
                </div>
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                    <p className="mt-4 text-slate-500 font-bold">Aggregating order data...</p>
                </div>
            ) : (
                <>
                    {/* Metrics */}
                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
                        <Card className="border-none shadow-sm bg-slate-900 text-white col-span-1 md:col-span-2 lg:col-span-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Gross Sales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black italic">₹{metrics.grossSales?.toLocaleString()}</div>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{metrics.totalOrders} Total Orders</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Commission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">₹{metrics.totalCommission?.toLocaleString()}</div>
                                <p className="text-xs text-slate-400 font-medium mt-1">Platform Revenue</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Refunds</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">₹{metrics.totalRefunds?.toLocaleString()}</div>
                                <p className="text-xs text-slate-400 font-medium mt-1">Returned/Cancelled</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-emerald-50 border-emerald-100 col-span-1 md:col-span-1 lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Amount to Pay</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-emerald-600">₹{metrics.amountToPay?.toLocaleString()}</div>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Net payable to vendor</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bank Details */}
                    {payoutData?.vendor?.bankDetails && (
                        <Card className="border-none shadow-sm bg-white border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement Destination</CardTitle>
                                    <p className="text-sm font-black text-slate-900">{payoutData.vendor.name}</p>
                                </div>
                                <Landmark className="h-5 w-5 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Bank Name</p>
                                        <p className="text-xs font-black text-slate-800">{payoutData.vendor.bankDetails.bankName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Account Number</p>
                                        <p className="text-xs font-mono font-black text-slate-800 tracking-tighter">{payoutData.vendor.bankDetails.accountNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Account Holder</p>
                                        <p className="text-xs font-black text-slate-800">{payoutData.vendor.bankDetails.accountHolder || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">IFSC Code</p>
                                        <p className="text-xs font-black text-slate-800">{payoutData.vendor.bankDetails.ifscCode || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Orders Table */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black text-slate-900">Order Items</CardTitle>
                                <CardDescription className="text-xs font-medium">Eligible items for the selected period</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead className="font-black text-slate-500 py-4">ORDER ID</TableHead>
                                        <TableHead className="font-black text-slate-500">DATE</TableHead>
                                        <TableHead className="font-black text-slate-500">PRODUCT</TableHead>
                                        <TableHead className="font-black text-slate-500 text-right">GROSS</TableHead>
                                        <TableHead className="font-black text-slate-500 text-right">COMMISSION</TableHead>
                                        <TableHead className="font-black text-slate-500 text-right text-emerald-600">NET</TableHead>
                                        <TableHead className="font-black text-slate-500 text-right pr-8">STATUS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-20 text-slate-400 italic">No delivered orders found for this period.</TableCell>
                                        </TableRow>
                                    ) : items.map((item: any, idx: number) => {
                                        const isSelected = selectedItems.some(p => p.orderId === item.orderId && p.productName === item.productName);
                                        const isPayable = !item.isLocked && !item.isRefunded && item.status !== 'COMPLETED';

                                        return (
                                            <TableRow
                                                key={`${item.orderId}-${idx}`}
                                                className={`${isSelected ? 'bg-emerald-50/30' : ''} ${!isPayable ? 'opacity-60' : 'cursor-pointer hover:bg-slate-50/50'}`}
                                                onClick={() => isPayable && toggleItemSelection(item)}
                                            >
                                                <TableCell>
                                                    {isPayable ? (
                                                        isSelected ? <CheckSquare className="h-5 w-5 text-emerald-600" /> : <Square className="h-5 w-5 text-slate-300" />
                                                    ) : (
                                                        item.isRefunded ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <div className="h-4 w-4" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono font-bold text-xs">#{item.orderId.slice(-8).toUpperCase()}</TableCell>
                                                <TableCell className="text-slate-500 text-xs font-bold">{format(new Date(item.orderDate), "dd MMM yy")}</TableCell>
                                                <TableCell>
                                                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity}</p>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-xs text-slate-600">₹{item.total.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-bold text-xs text-amber-600">₹{item.commission.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-black text-xs text-emerald-600">₹{item.net.toLocaleString()}</TableCell>
                                                <TableCell className="text-right pr-8">
                                                    {item.isRefunded ? (
                                                        <Badge className="bg-rose-100 text-rose-700 border-rose-200">Refunded</Badge>
                                                    ) : item.status === 'COMPLETED' ? (
                                                        <div className="flex flex-col items-end">
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-1">Paid</Badge>
                                                            <span className="text-[9px] font-mono text-slate-400">{item.payoutReference}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-400">Unsettled</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Pay Modal */}
            <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Process Settlement</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Enter transaction details to mark these items as paid. This will lock the orders.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Payout</p>
                            <p className="text-3xl font-black text-emerald-700">₹{selectedItems.reduce((acc, curr) => acc + curr.net, 0).toLocaleString()}</p>
                            <p className="text-xs text-emerald-600/70 font-bold mt-2">{selectedItems.length} order items selected</p>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="ref" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference / UTR</label>
                            <Input
                                id="ref"
                                placeholder="Ex: TAXPR20240201..."
                                className="h-12 font-bold bg-slate-50 border-slate-100"
                                value={transactionRef}
                                onChange={(e) => setTransactionRef(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="font-bold" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 font-black shadow-lg shadow-emerald-600/20"
                            onClick={handleMarkAsPaid}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Confirm Settlement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
