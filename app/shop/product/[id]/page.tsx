"use client"

import { useState, useEffect } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import type { Product } from "@/lib/products"
import { Star, StarHalf, Leaf, Truck, Shield, Recycle, Heart, Sparkles, CheckCircle } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { useRazorpay } from "@/hooks/use-razorpay"
import { useAuth } from "@/components/auth-provider"
import AuthModal from "@/components/auth-modal"
import { isProfileComplete } from "@/lib/utils"
import { Loader2 } from "lucide-react"


async function fetchProduct(id: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const apiUrl = `${baseUrl}/api/shop/${id}`;
  const res = await fetch(apiUrl, { cache: 'no-store' })

  if (!res.ok) return null
  return res.json()
}

// --- Mock Review Data and Components ---

interface Review {
  id: number;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    author: "Jane D.",
    rating: 5,
    title: "Absolutely love it!",
    content: "This product is fantastic. High quality, eco-friendly, and works exactly as described. I would highly recommend it to anyone looking for a sustainable option.",
    date: "October 25, 2025",
    verified: true,
  },
  {
    id: 2,
    author: "John S.",
    rating: 4,
    title: "Great product, minor issue",
    content: "Overall, a really great product. The only reason I'm not giving it 5 stars is that the packaging was slightly damaged on arrival. The product itself was fine though.",
    date: "October 22, 2025",
    verified: true,
  },
  {
    id: 3,
    author: "Emily R.",
    rating: 5,
    title: "Exceeded my expectations",
    content: "I was a bit skeptical at first, but this product has exceeded all my expectations. It's durable, looks great, and I feel good about using a product that's better for the planet.",
    date: "October 19, 2025",
    verified: false,
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-5 w-5 text-green-600 fill-green-600" />)}
      {halfStar && <StarHalf key="half" className="h-5 w-5 text-green-600 fill-green-600" />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300 fill-gray-300" />)}
    </div>
  );
};

const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

// --- Sustainability Badges ---
const SustainabilityBadges = () => (
  <div className="flex flex-wrap gap-3 mb-6">
    <div className="flex items-center gap-1 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm">
      <Leaf className="h-4 w-4" />
      <span>Eco-Friendly</span>
    </div>
    <div className="flex items-center gap-1 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
      <Recycle className="h-4 w-4" />
      <span>Recyclable</span>
    </div>
    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm">
      <Sparkles className="h-4 w-4" />
      <span>Natural Materials</span>
    </div>
  </div>
);

// --- Trust Badges ---
const TrustBadges = () => (
  <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
    <div className="flex flex-col items-center text-center">
      <Truck className="h-6 w-6 text-green-600 mb-2" />
      <span className="text-sm font-medium">Carbon Neutral Shipping</span>
    </div>
    <div className="flex flex-col items-center text-center">
      <Recycle className="h-6 w-6 text-green-600 mb-2" />
      <span className="text-sm font-medium">30-Day Return</span>
    </div>
    <div className="flex flex-col items-center text-center">
      <Shield className="h-6 w-6 text-green-600 mb-2" />
      <span className="text-sm font-medium">1-Year Warranty</span>
    </div>
  </div>
);

// --- End Mock Data ---

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { displayRazorpay } = useRazorpay();
  const { isAuthenticated, user } = useAuth();
  const [showAuthModalState, setShowAuthModalState] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const getProduct = async () => {
      if (!params?.id) return
      setIsLoading(true);
      const fetchedProduct = await fetchProduct(params.id as string);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      }
      setIsLoading(false);
    };
    getProduct();
  }, [params?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || "/placeholder.svg",
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const handleBuyNow = async () => {
    if (!product) return

    if (!isAuthenticated) {
      setShowAuthModalState(true)
      return
    }

    if (!isProfileComplete(user)) {
      // Add to cart first so they can checkout
      handleAddToCart()
      router.push('/checkout')
      return
    }

    setIsProcessing(true)
    try {
      // 1. Create Order
      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price,
          currency: 'INR',
        }),
      })

      if (!response.ok) throw new Error('Failed to create order')
      const orderData = await response.json()

      // 2. Display Razorpay
      await displayRazorpay({
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'EcoSaro',
        description: `Purchase ${product.name}`,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
      }, async (response) => {
        // 3. Verify Payment
        const shippingAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0]

        if (!shippingAddress) {
          toast({
            title: "Address Error",
            description: "No shipping address found. Please update your profile.",
            variant: "destructive",
          })
          return
        }

        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: [{
              productId: product._id,
              name: product.name,
              price: product.price,
              quantity: 1,
              image: product.images?.[0]
            }],
            totalAmount: product.price,
            shippingAddress: {
              name: shippingAddress.name,
              phone: shippingAddress.phone,
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              pincode: shippingAddress.pincode,
              country: shippingAddress.country || "India"
            }
          }),
        })

        const verifyData = await verifyRes.json()

        if (verifyData.success) {
          toast({
            title: "Payment Successful",
            description: "Your order has been placed successfully!",
          })
          router.push('/orders')
        } else {
          toast({
            title: "Payment Verification Failed",
            description: "Please contact support if the amount was deducted.",
            variant: "destructive",
          })
        }
      })
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    // You can add a loading skeleton here if you want
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  if (!product) return notFound()

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {showAuthModalState && (
        <AuthModal
          open={showAuthModalState}
          onOpenChange={(open) => setShowAuthModalState(open)}
          onSuccess={() => {
            setShowAuthModalState(false)
            handleBuyNow()
          }}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span>Home</span>
          <span>/</span>
          <span>Shop</span>
          <span>/</span>
          <span className="text-green-700 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-green-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-[500px] object-cover transition-transform hover:scale-105 duration-700"
                />
              ) : (
                <div className="w-full h-[500px] bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <Leaf className="h-16 w-16 text-green-300 mx-auto mb-4" />
                    <span className="text-gray-500 text-lg">Eco-friendly product image</span>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sustainable Choice
                </span>
              </div>
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square bg-white rounded-lg border border-green-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                  {/* Placeholder for additional product images */}
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                  <Heart className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center mb-4">
                <StarRating rating={averageRating} />
                <span className="ml-3 text-gray-600 font-medium">
                  {averageRating.toFixed(1)} • {reviews.length} reviews
                </span>
              </div>

              <SustainabilityBadges />

              <p className="text-gray-700 text-lg leading-relaxed mb-6">{product.description}</p>

              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">Planet Positive</h4>
                    <p className="text-green-700 text-sm">
                      This product helps reduce carbon emissions and supports reforestation projects with every purchase.
                    </p>
                  </div>
                </div>
              </div>

              <TrustBadges />
            </div>

            <div className="sticky bottom-0 bg-white rounded-2xl shadow-lg border border-green-100 p-6 mt-8">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-green-700">Rs {product.price.toFixed(2)}</p>
                  <p className="text-green-600 text-sm">Includes carbon offset</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">In stock</p>
                  <p className="text-green-600 text-sm font-medium">Ready to ship</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Leaf className="h-5 w-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isProcessing || product.stock === 0}
                  className="w-full border-2 border-green-600 text-green-700 py-4 px-6 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-gray-500 text-sm mt-4">
                ✓ Free shipping on all orders
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                  <div>
                    <StarRating rating={averageRating} />
                    <p className="text-gray-600 text-sm">{reviews.length} verified reviews</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
              <span>Write a Review</span>
            </button>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-green-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center font-bold text-green-800 text-lg">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{review.author}</p>
                        {review.verified && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{review.title}</h3>
                <p className="text-gray-600 leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Impact Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <Leaf className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your Purchase Makes a Difference</h2>
            <p className="text-green-100 text-lg mb-6">
              With this purchase, you're helping to remove 5kg of plastic from our oceans and
              supporting reforestation projects that plant 3 new trees.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">5kg</div>
                <div className="text-green-100">Plastic Removed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-green-100">Trees Planted</div>
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-green-100">Carbon Neutral</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}