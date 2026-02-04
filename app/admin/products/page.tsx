"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
    Package,
    Search,
    Loader2,
    Trash2,
    Store,
    Tag
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [productToDelete, setProductToDelete] = useState<string | null>(null)

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/admin/products")
            const result = await response.json()
            setProducts(result.products)
        } catch (error) {
            toast.error("Failed to fetch products")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const deleteProduct = async () => {
        if (!productToDelete) return
        try {
            const response = await fetch(`/api/admin/products?id=${productToDelete}`, {
                method: "DELETE"
            })
            const result = await response.json()
            if (result.success) {
                toast.success(result.message)
                fetchProducts()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to remove product")
        } finally {
            setProductToDelete(null)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Products</h1>
                    <p className="text-slate-500 font-medium">Monitor and moderate all items listed across the marketplace</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by product or vendor..."
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
                            <TableHead className="font-black text-slate-500 py-4">PRODUCT</TableHead>
                            <TableHead className="font-black text-slate-500">VENDOR</TableHead>
                            <TableHead className="font-black text-slate-500">CATEGORY</TableHead>
                            <TableHead className="font-black text-slate-500 text-right">PRICE</TableHead>
                            <TableHead className="font-black text-slate-500 text-right">STOCK</TableHead>
                            <TableHead className="font-black text-slate-500 text-right pr-8">ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic">No products found matching your search.</TableCell>
                            </TableRow>
                        ) : filteredProducts.map((product) => (
                            <TableRow key={product._id} className="hover:bg-slate-50/30">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-5 w-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 text-xs tracking-tight">{product.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {product._id.slice(-8)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                        <Store className="h-3.5 w-3.5 text-slate-400" />
                                        {product.vendor?.businessName || "Unknown Vendor"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                                        {product.category}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-black text-xs text-slate-900">
                                    ₹{product.price.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={`font-bold border-none bg-slate-100 ${product.stock < 10 ? 'text-rose-600 bg-rose-50' : 'text-slate-600'}`}>
                                        {product.stock} in stock
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => setProductToDelete(product._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black tracking-tight">Remove Product?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-slate-500">
                            This action will permanently remove this product from the platform. Vendors will need to re-list the item if this was an error.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-bold border-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 font-bold" onClick={deleteProduct}>
                            Yes, Remove Product
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
