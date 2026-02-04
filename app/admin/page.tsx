"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Store,
    Package,
    ShoppingBag,
    TrendingUp,
    DollarSign,
    Loader2,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/admin/stats")
                const result = await response.json()
                setStats(result.stats)
            } catch (error) {
                console.error("Failed to fetch admin stats", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `₹${stats?.totalRevenue?.toLocaleString()}`,
            description: "Platform-wide processed GMV",
            icon: DollarSign,
            color: "emerald",
            trend: "+12.5%",
            isPositive: true
        },
        {
            title: "Total Orders",
            value: stats?.orders,
            description: "Successfully processed orders",
            icon: ShoppingBag,
            color: "blue",
            trend: "+8.2%",
            isPositive: true
        },
        {
            title: "Active Vendors",
            value: stats?.vendors,
            description: `${stats?.pendingVendors} pending approval`,
            icon: Store,
            color: "amber",
            trend: "+5.1%",
            isPositive: true
        },
        {
            title: "Total Products",
            value: stats?.products,
            description: "Items available on marketplace",
            icon: Package,
            color: "rose",
            trend: "+15.4%",
            isPositive: true
        },
        {
            title: "Platform Revenue",
            value: `₹${stats?.platformCommission?.toLocaleString()}`,
            description: "Estimated net platform earnings",
            icon: TrendingUp,
            color: "slate",
            trend: "+21.2%",
            isPositive: true
        },
    ]

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
                <p className="text-slate-500 font-medium">Real-time performance and system health metrics</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            <div className="flex items-center mt-1">
                                <span className={`flex items-center text-[10px] font-black ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {stat.trend}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tighter">vs last month</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-3 border-t pt-2 border-slate-50">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-sm md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-slate-900">Vendor Performance</CardTitle>
                            <p className="text-xs text-slate-400 font-medium">Revenue and commission breakdown per business</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none">Top 5</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vendor</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Commission</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right text-emerald-600">To Pay</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats?.topVendors?.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">No sales data yet.</td>
                                        </tr>
                                    ) : stats?.topVendors?.map((v: any) => (
                                        <tr key={`${v.name}-${v.revenue}`} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/payouts?vendorId=${v.id}`}
                                                    className="text-xs font-black text-slate-800 hover:text-emerald-600 flex items-center gap-1"
                                                >
                                                    {v.name}
                                                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-bold text-slate-600">₹{v.revenue.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-bold text-amber-600">₹{v.commission.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-emerald-600">₹{v.pendingPayout.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-black text-slate-900">System Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { task: "Process Pending Payouts", status: "Ready", color: "emerald", count: stats?.orders || 0 },
                            { task: "Vendor Approvals", status: "Pending", color: "amber", count: stats?.pendingVendors || 0 },
                            { task: "Inventory Alerts", status: "Healthy", color: "slate", count: 0 },
                        ].map((item) => (
                            <div key={item.task} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full bg-${item.color}-500`} />
                                    <span className="text-xs font-bold text-slate-700">{item.task}</span>
                                </div>
                                <Badge variant="outline" className={`text-${item.color}-600 border-${item.color}-200 bg-${item.color}-50/50`}>
                                    {item.status} ({item.count})
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
