"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    ShieldAlert
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchVendors = async () => {
        try {
            const response = await fetch("/api/admin/vendors")
            const result = await response.json()
            setVendors(result.vendors)
        } catch (error) {
            toast.error("Failed to fetch vendors")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    const updateStatus = async (vendorId: string, status: string) => {
        try {
            const response = await fetch("/api/admin/vendors", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vendorId, status })
            })
            const result = await response.json()
            if (result.success) {
                toast.success(result.message)
                fetchVendors()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const filteredVendors = vendors.filter(v =>
        v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-emerald-100 text-emerald-700 border-none">Approved</Badge>
            case "pending":
                return <Badge className="bg-amber-100 text-amber-700 border-none">Pending Approval</Badge>
            case "suspended":
                return <Badge className="bg-slate-100 text-slate-700 border-none">Suspended</Badge>
            case "rejected":
                return <Badge className="bg-rose-100 text-rose-700 border-none">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Management</h1>
                    <p className="text-slate-500 font-medium">Manage ecosystem partners and their store permissions</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10 h-11 border-none bg-white shadow-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="font-black text-slate-500 py-4">VENDOR INFO</TableHead>
                            <TableHead className="font-black text-slate-500">CONTACT</TableHead>
                            <TableHead className="font-black text-slate-500">LOCATION</TableHead>
                            <TableHead className="font-black text-slate-500">STORE STATUS</TableHead>
                            <TableHead className="font-black text-slate-500 text-right pr-8">ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400 italic">No vendors found matching your search.</TableCell>
                            </TableRow>
                        ) : filteredVendors.map((vendor) => (
                            <TableRow key={vendor._id} className="hover:bg-slate-50/30">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800 tracking-tight">{vendor.businessName}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {vendor._id.slice(-8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                            {vendor.businessEmail}
                                        </div>
                                        {vendor.businessPhone && (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <Phone className="h-3 w-3 text-slate-400" />
                                                {vendor.businessPhone}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        {vendor.businessAddress?.city}, {vendor.businessAddress?.state}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(vendor.status)}
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>Manage Verification</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-emerald-600 font-bold"
                                                onClick={() => updateStatus(vendor._id, "approved")}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Vendor
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-rose-600 font-bold"
                                                onClick={() => updateStatus(vendor._id, "rejected")}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" /> Reject Application
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-slate-600 font-bold"
                                                onClick={() => updateStatus(vendor._id, "suspended")}
                                            >
                                                <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Store
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
