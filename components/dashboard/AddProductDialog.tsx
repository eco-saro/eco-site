"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Plus, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface AddProductDialogProps {
    onProductAdded: () => void
}

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const { data: session } = useSession()
    const [lastError, setLastError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        images: [] as string[],
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCategoryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, category: value }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized: Please ensure you are logged in as a vendor.")
                }
                const errorData = await response.json().catch(() => ({ message: response.statusText }))
                console.error("Upload failed details:", errorData)
                throw new Error(errorData.message || `Upload failed with status: ${response.status}`)
            }

            const data = await response.json()
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, data.url],
            }))
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error("Upload error:", error)
            const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
            setLastError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create product")
            }

            toast.success("Product created successfully")
            setFormData({
                name: "",
                description: "",
                price: "",
                category: "",
                stock: "",
                images: [],
            })
            setOpen(false)
            onProductAdded()
        } catch (error) {
            console.error("Create product error:", error)
            toast.error("Failed to create product")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add New Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new product to your store.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Organic Cotton T-Shirt"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your product..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                            {formData.price && !isNaN(parseFloat(formData.price)) && (
                                <div className="text-xs text-gray-500 mt-1 space-y-1 bg-gray-50 p-2 rounded-md border">
                                    <div className="flex justify-between">
                                        <span>Platform Fee (5%):</span>
                                        <span className="font-medium text-amber-600">-${(parseFloat(formData.price) * 0.05).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                        <span className="font-medium text-gray-700">Your Earnings:</span>
                                        <span className="font-bold text-green-600">Rs {(parseFloat(formData.price) * 0.95).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={handleCategoryChange} value={formData.category} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Agro Products">Agro Products</SelectItem>
                                <SelectItem value="Eco Friendly">Eco Friendly</SelectItem>
                                <SelectItem value="Herbal Products">Herbal Products</SelectItem>
                                <SelectItem value="Natural Cosmetics">Natural Cosmetics</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Product Images</Label>
                        <div className="flex flex-wrap gap-4 mb-2">
                            {formData.images.map((url, index) => (
                                <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
                                    <Image
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">Upload</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading || uploading} className="bg-green-600 hover:bg-green-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Product
                        </Button>
                    </DialogFooter>

                    {/* Debug Info */}
                    <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
                        <p><strong>Debug Info:</strong></p>
                        <p>User Role: {(session?.user as any)?.role || 'Unknown'}</p>
                        <p>Authenticated: {session ? 'Yes' : 'No'}</p>
                        {lastError && <p className="text-red-500">Last Error: {lastError}</p>}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
