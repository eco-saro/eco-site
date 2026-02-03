"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  Search,
  Plus,
  Filter,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Check
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Badge } from "../../../components/ui/badge"
import { Checkbox } from "../../../components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "../../../components/ui/pagination"
import { AddProductDialog } from "../../../components/dashboard/AddProductDialog"
import { EditProductDialog } from "../../../components/dashboard/EditProductDialog"
import { toast } from "sonner"

import { useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products?role=vendor", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id))
    }
  }

  // Filter products based on search, category, status, and active tab
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    const matchesTab = activeTab === "all" ||
      (activeTab === "in_stock" && product.status === "active") ||
      (activeTab === "low_stock" && product.status === "low_stock") ||
      (activeTab === "out_of_stock" && product.status === "out_of_stock") ||
      (activeTab === "hidden" && product.status === "hidden")

    return matchesSearch && matchesCategory && matchesStatus && matchesTab
  })

  // Extract unique categories for filter dropdown from actual products
  const uniqueCategories = Array.from(new Set(products.map(product => product.category)))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">In Stock</Badge>
      case "low_stock":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Low Stock</Badge>
      case "out_of_stock":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Out of Stock</Badge>
      case "hidden":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Hidden</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const [isBankingComplete, setIsBankingComplete] = useState(false);
  const [checkingBanking, setCheckingBanking] = useState(true);

  useEffect(() => {
    const checkBankingDetails = async () => {
      try {
        const response = await fetch("/api/vendor/store");
        if (response.ok) {
          const data = await response.json();
          const payout = data.payoutDetails;
          if (payout && payout.bankName && payout.accountNumber && payout.accountHolder && payout.ifscCode) {
            setIsBankingComplete(true);
          }
        }
      } catch (error) {
        console.error("Failed to check banking details", error);
      } finally {
        setCheckingBanking(false);
      }
    };
    checkBankingDetails();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      // Optimistic update
      setProducts(prev => prev.filter(p => p._id !== productId))

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast.success("Product deleted successfully")
      refreshProducts()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete product")
      refreshProducts() // Revert state on error
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setIsEditOpen(true)
  }

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products?role=vendor", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          {!checkingBanking && !isBankingComplete ? (
            <Button
              className="bg-gray-400 cursor-not-allowed flex items-center gap-1"
              onClick={() => alert("Please complete your banking details in Store Settings to add products.")}
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          ) : (
            <AddProductDialog onProductAdded={refreshProducts} />
          )}
          <EditProductDialog
            product={editingProduct}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onProductUpdated={refreshProducts}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="in_stock">In Stock</TabsTrigger>
                <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
                <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
                <TabsTrigger value="hidden">Hidden</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8 w-full sm:w-auto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Tabs>
        </CardHeader>

        <CardContent>
          {selectedProducts.length > 0 && (
            <div className="mb-4 p-2 flex items-center justify-between bg-slate-50 rounded-md border">
              <span className="text-sm font-medium ml-2">{selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Update Status</Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Delete Selected</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onCheckedChange={() => toggleProductSelection(product._id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          IMG
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">{product._id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>Rs {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {product.stock === 0 ? (
                          <span className="text-red-600 font-medium">0</span>
                        ) : product.stock < 10 ? (
                          <span className="text-yellow-600 font-medium">{product.stock}</span>
                        ) : (
                          <span>{product.stock}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.variants}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="flex items-center cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {product.status !== "active" && (
                            <DropdownMenuItem className="flex items-center text-green-600 cursor-pointer">
                              <Check className="h-4 w-4 mr-2" /> Mark as Active
                            </DropdownMenuItem>
                          )}
                          {product.status !== "hidden" && (
                            <DropdownMenuItem className="flex items-center text-gray-600 cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" /> Hide Product
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="flex items-center text-red-600 cursor-pointer"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium">No products found</h3>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  )
}
