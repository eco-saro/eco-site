"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  Search,
  DollarSign,
  Filter,
  Download,
  Calendar,
  ArrowDown,
  ArrowUp,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Banknote
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Badge } from "../../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import Link from "next/link"

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentTab, setCurrentTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/vendor/payments")
        const result = await response.json()
        if (result.success) {
          setData(result)
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPayments()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  const { metrics, transactions, vendor } = data || { metrics: {}, transactions: [], vendor: {} }

  const filteredPayments = transactions.filter((payment: any) => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || payment.type === typeFilter

    const matchesTab = currentTab === "all" ||
      (currentTab === "incoming" && (payment.type === "sale")) ||
      (currentTab === "outgoing" && (payment.type === "payout" || payment.type === "refund"))

    return matchesSearch && matchesType && matchesTab
  })

  const getAmountColor = (payment: any) => {
    if (payment.type === "sale") return "text-emerald-600";
    if (payment.type === "payout" || payment.type === "refund") return "text-rose-600";
    return "text-slate-600";
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case "blocked":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Blocked</Badge>
      case "failed":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Failed</Badge>
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ArrowDown className="h-4 w-4 text-emerald-600" />
      case "payout":
        return <Banknote className="h-4 w-4 text-rose-600" />
      case "refund":
        return <ArrowUp className="h-4 w-4 text-rose-600" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Payouts</h1>
          <p className="text-slate-500 font-medium">Track your income and settlement history</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" className="font-bold border-slate-200 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Bank Validation Warning */}
      {!vendor.hasBankDetails && (
        <Alert className="bg-rose-50 border-rose-200 text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <AlertTitle className="font-bold">Payouts are Blocked</AlertTitle>
          <AlertDescription className="font-medium">
            ⚠️ Add your bank details to receive payouts. Currently, all your earnings are being held.
            <Link href="/dashboard/store" className="ml-2 underline font-black">Go to Settings</Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">₹{metrics.totalEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-emerald-600 font-bold mt-1">Successfully settled</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">₹{metrics.pendingPayouts?.toLocaleString() || 0}</div>
            <p className="text-xs text-amber-600 font-bold mt-1">Held or processing</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">₹{metrics.processingFees?.toLocaleString() || 0}</div>
            <p className="text-xs text-slate-400 font-bold mt-1">Platform commission</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-white border-b border-slate-50">
          <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <TabsList className="bg-slate-100/50 p-1">
                <TabsTrigger value="all" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                <TabsTrigger value="incoming" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-emerald-600">Earnings</TabsTrigger>
                <TabsTrigger value="outgoing" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm text-rose-600">Payouts</TabsTrigger>
              </TabsList>

              <div className="flex gap-3 flex-1 md:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by ID or reference..."
                    className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-emerald-500 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] h-11 bg-slate-50 border-none font-bold">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sale">Earnings</SelectItem>
                    <SelectItem value="payout">Payouts</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-none hover:bg-slate-50/50">
                <TableHead className="py-4 font-bold text-slate-500">TRANSACTION ID</TableHead>
                <TableHead className="py-4 font-bold text-slate-500">DATE</TableHead>
                <TableHead className="py-4 font-bold text-slate-500">TYPE</TableHead>
                <TableHead className="py-4 font-bold text-slate-500">REFERENCE</TableHead>
                <TableHead className="py-4 font-bold text-slate-500 text-right">AMOUNT</TableHead>
                <TableHead className="py-4 font-bold text-slate-500 text-right pr-6">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment: any) => (
                  <TableRow key={payment.id} className="border-slate-50 hover:bg-slate-50/30">
                    <TableCell className="font-mono font-bold text-slate-700">#{payment.id}</TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {format(new Date(payment.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-600">
                        {getTypeIcon(payment.type)}
                        {payment.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">{payment.reference}</TableCell>
                    <TableCell className={`font-black text-right ${getAmountColor(payment)}`}>
                      {payment.amount > 0 ? "+" : ""}
                      ₹{Math.abs(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {getStatusBadge(payment.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-medium italic">
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
