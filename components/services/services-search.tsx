"use client"

import { useState } from "react"
import { MapPin, Search, Leaf, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

export default function ServicesSearch() {
    const [location, setLocation] = useState("")
    const [service, setService] = useState("")
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = () => {
        if (!location || !service) return
        setHasSearched(true)
        console.log("Searching for:", service, "in", location)
    }

    return (
        <section className="relative py-20 overflow-hidden bg-white">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />

            <div className="container relative px-4 mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <Leaf className="w-3 h-3" />
                        Sustainable Solutions
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                        Professional <span className="text-emerald-600">Eco-Services</span> <br />
                        Right at Your Doorstep
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Find the best eco-friendly services in your area. From sustainable gardening to waste management, we've got you covered.
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-2 md:p-3 rounded-2xl md:rounded-full border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">
                    <div className="flex-1 w-full flex items-center gap-2 px-4 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0">
                        <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                        <Input
                            placeholder="Enter your location..."
                            className="border-none focus-visible:ring-0 text-slate-700 font-medium placeholder:text-slate-400 h-12"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 w-full flex items-center gap-2 px-4 py-2 md:py-0">
                        <Search className="w-5 h-5 text-emerald-500 shrink-0" />
                        <Select onValueChange={setService}>
                            <SelectTrigger className="border-none focus:ring-0 text-slate-700 font-medium h-12 bg-transparent">
                                <SelectValue placeholder="What service are you looking for?" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="gardening">Eco-Gardening</SelectItem>
                                <SelectItem value="waste">Waste Management</SelectItem>
                                <SelectItem value="solar">Solar Maintenance</SelectItem>
                                <SelectItem value="cleaning">Green Cleaning</SelectItem>
                                <SelectItem value="pest">Natural Pest Control</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="w-full md:w-auto h-12 md:h-14 px-8 rounded-xl md:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-200"
                    >
                        Find Services
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Quick Tags */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Popular:</p>
                    <button className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                        Composting
                    </button>
                    <button className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                        Vertical Garden
                    </button>
                    <button className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                        Solar Panel Repair
                    </button>
                </div>

                {hasSearched && (
                    <div className="mt-16 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 border border-slate-100 mb-6 shadow-sm">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No services found in the area</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">
                            We couldn't find any <span className="text-emerald-600 font-bold">{service}</span> professionals in <span className="text-emerald-600 font-bold">{location}</span> at the moment. Try searching for a nearby city.
                        </p>
                        <Button
                            variant="link"
                            className="mt-4 text-emerald-600 font-bold"
                            onClick={() => {
                                setHasSearched(false)
                                setLocation("")
                            }}
                        >
                            Clear search and try again
                        </Button>
                    </div>
                )}
            </div>
        </section>
    )
}
