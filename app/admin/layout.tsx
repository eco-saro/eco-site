"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertTriangle,
    LayoutDashboard,
    Users,
    CreditCard,
    Menu,
    X,
    Package,
    ArrowRightLeft,
    Settings
} from "lucide-react"

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const router = useRouter()
    const { user } = useAuth()
    const { status } = useSession()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        if (status === 'authenticated' && user) {
            if ((user as any).role === 'admin') {
                setAuthorized(true)
            }
            setLoading(false)
        }
    }, [user, router, status])

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            current: pathname === '/admin'
        },
        {
            name: 'Vendors',
            href: '/admin/vendors',
            icon: Users,
            current: pathname === '/admin/vendors'
        },
        {
            name: 'Orders',
            href: '/admin/orders',
            icon: Package,
            current: pathname === '/admin/orders'
        },
        {
            name: 'Products',
            href: '/admin/products',
            icon: Package,
            current: pathname === '/admin/products'
        },
        {
            name: 'Vendor Payouts',
            href: '/admin/payouts',
            icon: CreditCard,
            current: pathname === '/admin/payouts'
        },
        {
            name: 'Refund Queue',
            href: '/admin/refunds',
            icon: ArrowRightLeft,
            current: pathname === '/admin/refunds'
        },
        {
            name: 'Platform Settings',
            href: '/admin/settings',
            icon: Settings,
            current: pathname === '/admin/settings'
        },
    ]

    if (!loading && !authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full">
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            You don't have permission to access the admin dashboard.
                        </AlertDescription>
                    </Alert>
                    <div className="text-center mt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Toggle */}
            <div className="bg-white lg:hidden fixed top-0 left-0 right-0 px-4 py-3 z-30 border-b flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="p-2 rounded-md text-gray-500 focus:outline-none"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                    <span className="ml-3 text-lg font-medium text-gray-900">Admin Dashboard</span>
                </div>
            </div>

            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <button
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden w-full h-full border-none p-0 cursor-default"
                    onClick={() => setIsSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setIsSidebarOpen(false)
                        }
                    }}
                    aria-label="Close sidebar"
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="h-16 flex items-center px-6 bg-slate-950">
                    <Link href="/" className="flex items-center">
                        <span className="text-xl font-black tracking-tighter text-emerald-400">ECO<span className="text-white">SARO</span></span>
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Admin</span>
                    </Link>
                </div>

                <nav className="mt-8 px-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${item.current
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <item.icon className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-slate-500'}`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b sticky top-0 z-10 hidden lg:flex items-center justify-between px-8">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{navigation.find(n => n.current)?.name || 'Admin'}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-900">{user?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Administrator</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs border border-emerald-200">
                            {user?.name?.[0]}
                        </div>
                    </div>
                </header>
                <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
