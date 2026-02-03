import { Suspense } from "react"
import type { Metadata } from "next"
import ProfilePage from "@/components/profile/profile-page"

export const metadata: Metadata = {
  title: "My Profile | EcoSaro",
  description: "Manage your EcoSaro account settings and view your order history.",
}

export default async function ProfileRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePage />
    </Suspense>
  )
}
