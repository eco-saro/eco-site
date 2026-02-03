"use client"

import { Suspense } from "react"
import CheckoutPageClient from "@/components/checkout/checkout-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutPage() {

  // Removed redirect to profile - users can add address on checkout page

  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPageClient />
    </Suspense>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="container px-4 py-10 mx-auto">
      <div className="mb-6">
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
