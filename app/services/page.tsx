import type { Metadata } from "next"
import ServicesSearch from "@/components/services/services-search"

export const metadata: Metadata = {
  title: "Eco-Friendly Services | EcoSaro",
  description: "Find and book professional eco-friendly services for your home and garden.",
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <ServicesSearch />

      {/* Container for future content (Categories, Featured, etc.) */}
      <div className="container px-4 mx-auto pb-20">
        <div className="h-px bg-slate-100 w-full mb-20" />

        {/* You can add more sections here as you rebuild the page */}
        <div className="text-center py-20">
          <p className="text-slate-400 font-medium italic">
            Select a service above to explore available options in your area.
          </p>
        </div>
      </div>
    </main>
  )
}
