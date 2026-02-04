"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Settings,
    Percent,
    Mail,
    Phone,
    Database,
    Save,
    Loader2,
    ShieldCheck
} from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({
        commissionRate: 10,
        supportEmail: "support@ecosaro.com",
        supportPhone: "+91 999 999 9999",
        lowStockThreshold: 5
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const fetchSettings = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/settings")
            const data = await response.json()
            if (data.settings) {
                setSettings(data.settings)
            }
        } catch (error) {
            toast.error("Failed to load settings")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const response = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })
            const data = await response.json()
            if (data.success) {
                toast.success("Platform settings updated")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-bold">Retrieving platform configuration...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
                    <p className="text-slate-500 font-medium">Fine-tune marketplace commission and operational parameters</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Admin Access Only</span>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Commission Settings */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-xl">
                                    <Percent className="h-5 w-5 text-amber-600" />
                                </div>
                                <CardTitle className="text-lg font-black text-slate-900">Revenue Logic</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Platform Commission (%)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={settings.commissionRate}
                                        onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
                                        className="h-12 border-slate-100 bg-slate-50 font-black text-lg focus:ring-emerald-500"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                                    This percentage is deducted from every vendor sale. Changing this will only affect new orders.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Settings */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Database className="h-5 w-5 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg font-black text-slate-900">Inventory Limits</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Low Stock Threshold</Label>
                                <Input
                                    type="number"
                                    value={settings.lowStockThreshold}
                                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                                    className="h-12 border-slate-100 bg-slate-50 font-black text-lg focus:ring-emerald-500"
                                />
                                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                                    Products with stock below this number will be flagged as "Low Stock" in the dashboard.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Settings */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <Mail className="h-5 w-5 text-emerald-600" />
                            </div>
                            <CardTitle className="text-lg font-black text-slate-900">Communication</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Support Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        className="h-12 pl-10 border-slate-100 bg-slate-50 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Support Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        type="text"
                                        value={settings.supportPhone}
                                        onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                                        className="h-12 pl-10 border-slate-100 bg-slate-50 font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 h-12 rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-1"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Applying Changes...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <Card className="border-none shadow-sm bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <Settings className="h-10 w-10 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">System Core Updates</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">Changes to commission rates will take effect immediately for all subsequent orders. Historical orders will retain their original commission logic for audit purposes.</p>
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </Card>
        </div>
    )
}
