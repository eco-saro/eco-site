"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    Info,
    ArrowRightLeft,
    Loader2,
    RefreshCw
} from "lucide-react"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { toast } from "sonner"

export default function AdminRefundsPage() {
    const [refunds, setRefunds] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("PENDING")
    const [selectedRefund, setSelectedRefund] = useState<any>(null)
    const [isActionOpen, setIsActionOpen] = useState(false)
    const [adminNotes, setAdminNotes] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const fetchRefunds = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/admin/refunds?status=${statusFilter}`)
            const data = await response.json()
            setRefunds(data.refunds || [])
        } catch (error) {
            toast.error("Failed to load refund requests")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRefunds()
    }, [statusFilter])

    const handleAction = async (newStatus: 'APPROVED' | 'REJECTED') => {
        setIsProcessing(true)
        try {
            const response = await fetch("/api/admin/refunds", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refundId: selectedRefund._id,
                    status: newStatus,
                    adminNotes
                })
            })
            const result = await response.json()
            if (result.success) {
                toast.success(result.message)
                setIsActionOpen(false)
                setAdminNotes("")
                fetchRefunds()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Action failed")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refund Queue</h1>
                    <p className="text-slate-500 font-medium">Moderate customer refund requests and resolve platform disputes</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === "PENDING" ? "default" : "outline"}
                        className={`font-bold ${statusFilter === "PENDING" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                        onClick={() => setStatusFilter("PENDING")}
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === "APPROVED" ? "default" : "outline"}
                        className={`font-bold ${statusFilter === "APPROVED" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                        onClick={() => setStatusFilter("APPROVED")}
                    >
                        Approved
                    </Button>
                    <Button
                        variant={statusFilter === "REJECTED" ? "default" : "outline"}
                        className={`font-bold ${statusFilter === "REJECTED" ? "bg-rose-500 hover:bg-rose-600" : ""}`}
                        onClick={() => setStatusFilter("REJECTED")}
                    >
                        Rejected
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchRefunds}
                        className="ml-2"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50">
                    <CardTitle className="text-lg font-black text-slate-900">Current Requests</CardTitle>
                    <CardDescription className="text-xs font-medium">Review and process active refund claims</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="font-black text-slate-500 py-4">REQUESTED ON</TableHead>
                                <TableHead className="font-black text-slate-500">ORDER ID</TableHead>
                                <TableHead className="font-black text-slate-500">CUSTOMER</TableHead>
                                <TableHead className="font-black text-slate-500">VENDOR</TableHead>
                                <TableHead className="font-black text-slate-500 text-right">AMOUNT</TableHead>
                                <TableHead className="font-black text-slate-500 text-center">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20">
                                        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : refunds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic">No refund requests in this queue.</TableCell>
                                </TableRow>
                            ) : refunds.map((refund) => (
                                <TableRow key={refund._id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="text-xs font-bold text-slate-500 uppercase">
                                        {format(new Date(refund.createdAt), "dd MMM, yyyy")}
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-xs uppercase text-slate-900">
                                        #{refund.order?._id?.slice(-8)}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-xs font-black text-slate-800">{refund.user?.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{refund.user?.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-black border-slate-100 uppercase">{refund.vendor?.businessName}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-sm text-rose-600">
                                        ₹{refund.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {refund.status === 'PENDING' ? (
                                            <Button
                                                size="sm"
                                                className="bg-slate-900 hover:bg-slate-800 font-black h-8 text-[10px]"
                                                onClick={() => {
                                                    setSelectedRefund(refund)
                                                    setIsActionOpen(true)
                                                }}
                                            >
                                                Moderate
                                            </Button>
                                        ) : (
                                            <Badge className={refund.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                                                {refund.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Refund Action Modal */}
            <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Review Refund Request</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Examine the reason provided and decide how to proceed.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRefund && (
                        <div className="py-6 space-y-6">
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3">
                                <div className="p-2 bg-rose-100 rounded-xl h-fit">
                                    <AlertCircle className="h-5 w-5 text-rose-700" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-rose-900 italic">" {selectedRefund.reason} "</h4>
                                    <p className="text-xs text-rose-600/70 font-bold">Problem description provided by customer</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacted Order</p>
                                    <p className="text-xs font-black text-slate-800">#{selectedRefund.order?._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Claim Amount</p>
                                    <p className="text-xs font-black text-rose-600 italic">₹{selectedRefund.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Response / Internal Notes</label>
                                <Textarea
                                    placeholder="Explain the decision or add internal notes..."
                                    className="min-h-[100px] font-bold bg-slate-50 border-slate-100"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 font-black h-12"
                            onClick={() => handleAction('REJECTED')}
                            disabled={isProcessing}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Claim
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 font-black h-12"
                            onClick={() => handleAction('APPROVED')}
                            disabled={isProcessing}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
