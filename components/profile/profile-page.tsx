'use client'

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Calendar, Package, Settings as SettingsIcon, LogOut, User, MapPin, CreditCard, HelpCircle, Star, ChevronRight, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator';


const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'orders', label: 'My Orders', icon: Package },
  { key: 'settings', label: 'Account Settings', icon: SettingsIcon },
];

// Define address type
type Address = {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}
// order type
type Order = {
  _id: string
  createdAt: string
  totalAmount: number
  status: string
  products: {
    productId: string
    name: string
    price: number
    quantity: number
    image?: string
  }[]
  shippingAddress?: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
}
export default function ProfilePage() {

  const { user, logout, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form states
  const [orders, setOrders] = useState<Order[]>([])
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    loyaltyPoints: 0
  })

  // Initialize form data


  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      // Validate phone number
      const phoneRegex = /^[6-9]\d{9}$/;
      if (phone && !phoneRegex.test(phone)) {
        toast({
          title: 'Invalid Phone',
          description: 'Please enter a valid 10-digit Indian phone number',
          variant: 'destructive'
        });
        return;
      }

      // Prepare updated user data
      const updatedData = {
        name,
        email,
        phone,
        image: profilePic ?? undefined,
        address
      };

      // Call API to update user data
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      updateUser(data.user);

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to save your changes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [name, email, phone, profilePic, address, updateUser, toast]);

  //fetch orders
  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`)
        const data = await res.json()
        if (data.success) {
          setOrders(data.orders)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchProfileData = async () => {
      try {
        const res = await fetch('/api/user/profile')
        const data = await res.json()

        if (data.success) {
          setStats(data.stats)

          // Update form fields with fetched data
          const fetchedUser = data.user
          setName(fetchedUser.name || '')
          setEmail(fetchedUser.email || '')
          setPhone(fetchedUser.phone || '')
          setProfilePic(fetchedUser.image || null)

          // Update address
          const defaultAddress = fetchedUser.addresses?.find((addr: any) => addr.isDefault) || fetchedUser.addresses?.[0]

          if (defaultAddress) {
            setAddress({
              street: defaultAddress.street || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              postalCode: defaultAddress.pincode || '',
              country: defaultAddress.country || 'India',
            })
          }

          // Sync with auth context
          updateUser(fetchedUser)
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfileData()
  }, [user?.id])

  // Check for redirect warning
  useEffect(() => {
    const warning = searchParams.get('warning')
    if (warning === 'incomplete') {
      setActiveTab('settings')
      toast({
        title: "Profile Incomplete",
        description: "Please add your shipping address to proceed with the purchase.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])


  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Loading skeleton */}
        <div className="max-w-6xl mx-auto w-full py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar skeleton */}
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm p-6 h-fit">
              <div className="flex flex-col items-center mb-6">
                <div className="bg-gray-200 rounded-full w-24 h-24 mb-4"></div>
                <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto w-full py-8 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span>Home</span>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span>My Account</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-sm p-6 h-fit">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-4">
                {profilePic ? (
                  <Image
                    src={profilePic}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover border-2 border-green-100"
                  />
                ) : (
                  <div className="bg-gray-100 border-2 border-dashed rounded-full w-full h-full flex items-center justify-center">
                    <User className="text-gray-400 w-10 h-10" />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold">{name}</h2>
            </div>

            <nav className="space-y-2">
              {SIDEBAR_ITEMS.map(item => (
                <button
                  key={item.key}
                  className={cn(
                    'flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors',
                    activeTab === item.key
                      ? 'bg-green-50 text-green-700'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => setActiveTab(item.key)}
                >
                  <item.icon className={cn(
                    "w-5 h-5 mr-3",
                    activeTab === item.key ? "text-green-600" : "text-gray-500"
                  )} />
                  {item.label}
                </button>
              ))}

              <button
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4"
                onClick={logout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">Welcome back, {name.split(' ')[0]}!</h1>
                      <p className="text-gray-600 mt-2">Here's what's happening with your account today</p>
                    </div>
                    <Button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700">
                      View Account
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <Package className="text-green-600 w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-xl font-bold mt-1">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </div>



                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <Star className="text-green-600 w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Loyalty Points</p>
                        <p className="text-xl font-bold mt-1">{stats.loyaltyPoints}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-200"
                      onClick={() => setActiveTab('orders')}
                    >
                      View All Orders
                    </Button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">You haven’t placed any orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 2).map(order => (
                        <div key={order._id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-semibold text-gray-900 truncate max-w-[200px]">
                              {order.products?.length > 0
                                ? order.products.map((p: any) => p.name).join(", ")
                                : `Order #${order._id.slice(-6).toUpperCase()}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(order.createdAt), 'dd MMM yyyy')} • {order.products?.length || 0} item{(order.products?.length || 0) > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center mt-2 md:mt-0">
                            <div className="mr-4">
                              <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                              <p className={`text-xs mt-1 ${order.status === 'Delivered' ? 'text-green-600' :
                                order.status === 'Processing' ? 'text-yellow-600' : 'text-gray-600'
                                }`}>
                                {order.status}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsDetailsOpen(true)
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>



              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-bold">My Orders</h1>
                  <div className="flex space-x-2">
                    <Input placeholder="Search orders..." className="max-w-xs" />
                    <Button variant="outline">Filter</Button>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-gray-500">Your orders will appear here once you make a purchase.</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">Start Shopping</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="border rounded-lg p-4 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {order.products?.length > 0
                                ? order.products.map((p: any) => p.name).join(", ")
                                : `Order #${order._id.slice(-6).toUpperCase()}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(order.createdAt), 'dd MMM yyyy')} • {order.products?.length || 0} item{(order.products?.length || 0) > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                            <p
                              className={`text-xs mt-1 ${order.status === 'Delivered'
                                ? 'text-green-600'
                                : order.status === 'Processing'
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                                }`}
                            >
                              {order.status}
                            </p>
                          </div>
                        </div>

                        <div className="flex mt-4 justify-between">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsDetailsOpen(true)
                              }}
                            >
                              View Details
                            </Button>
                            {order.status === 'Delivered' && (
                              <Button variant="outline" size="sm">
                                Rate Product
                              </Button>
                            )}
                          </div>
                          {order.status === 'Processing' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Track Order
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-xl font-bold mb-6">Account Settings</h1>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          maxLength={10}
                        />
                        {phone && !/^[6-9]/.test(phone) && (
                          <p className="text-red-500 text-xs mt-1">Phone number should start with 6,7,8 or 9</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="relative w-24 h-24">
                        {profilePic ? (
                          <Image
                            src={profilePic}
                            alt="Profile"
                            fill
                            className="rounded-full object-cover border-2 border-green-100"
                          />
                        ) : (
                          <div className="bg-gray-100 border-2 border-dashed rounded-full w-full h-full flex items-center justify-center">
                            <User className="text-gray-400 w-10 h-10" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Address</h2>
                      <Button variant="outline" className="border-green-300 text-green-700">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add New Address
                      </Button>
                    </div>

                    <div className="border rounded-lg p-5 bg-green-50 border-green-200">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Primary Address</h3>
                        <Button variant="link" className="text-green-600 p-0 h-auto">
                          Edit
                        </Button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Street Address</Label>
                          <Textarea
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            placeholder="House number, street, area"
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <Label>City</Label>
                          <Input
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="Enter your city"
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <Label>State</Label>
                          <Input
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            placeholder="Enter your state"
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <Label>Postal Code</Label>
                          <Input
                            value={address.postalCode}
                            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                            placeholder="Enter postal code"
                            maxLength={6}
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <Label>Country</Label>
                          <Input
                            value={address.country}
                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            placeholder="Enter country"
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setName(user?.name || '');
                        setPhone(user?.phone || '');
                        setProfilePic(user?.image || null);

                        const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

                        setAddress(defaultAddress
                          ? {
                            street: defaultAddress.street,
                            city: defaultAddress.city,
                            state: defaultAddress.state,
                            postalCode: defaultAddress.pincode || '',
                            country: defaultAddress.country,
                          }
                          : {
                            street: '',
                            city: '',
                            state: '',
                            postalCode: '',
                            country: 'India'
                          });
                      }}
                    >
                      Discard Changes
                    </Button>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-bold">#{selectedOrder._id.toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed on {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={cn(
                    "mt-1",
                    selectedOrder.status === 'completed' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                      selectedOrder.status === 'Processing' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                        "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  )}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                      <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">Shipping Address</h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm">
                      <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.pincode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      <p className="mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No address information available</p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-base pt-1">
                      <span>Total</span>
                      <span className="text-green-700">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
