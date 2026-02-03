import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { User } from "@/models/user"
import { Order } from "@/models/order.model"
import dbConnect from "@/lib/dbconnect"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const userId = session.user.id
        console.log("Fetching profile for:", userId)
        const user = await User.findById(userId).select("-password")

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Fetch stats for overview
        const orderCount = await Order.countDocuments({ user: userId })

        // Placeholder for bookings and loyalty points as they don't exist in models yet
        const bookingCount = 0
        const loyaltyPoints = 0

        return NextResponse.json({
            success: true,
            user,
            stats: {
                totalOrders: orderCount,
                upcomingBookings: bookingCount,
                loyaltyPoints: loyaltyPoints
            }
        })
    } catch (error) {
        console.error("Error fetching profile:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, phone, image, address } = body

        await dbConnect()

        const userId = session.user.id

        // Construct update object
        const updateData: any = {}
        if (name) updateData.name = name
        if (phone) updateData.phone = phone
        if (image) updateData.image = image

        // Handle address update - assuming single address for now based on UI
        // The UI sends 'address' object. The model has 'addresses' array.
        // We will update the default address or add a new one if none exists.

        const user = await User.findById(userId)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        console.log("Updating profile for:", userId, "Body:", body)

        if (address && address.street && address.city && address.state && address.postalCode && address.country) {
            // Check if there is a default address
            const defaultAddressIndex = user.addresses.findIndex((a: any) => a.isDefault)

            const newAddress = {
                label: "Home", // Default label
                name: name || user.name,
                phone: phone || user.phone || "0000000000", // Fallback if empty
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.postalCode,
                country: address.country,
                isDefault: true
            }

            if (defaultAddressIndex > -1) {
                // Update existing default address
                // Use Object.assign to update the subdocument in place
                Object.assign(user.addresses[defaultAddressIndex], newAddress)
            } else {
                // Add new address
                if (user.addresses.length > 0) {
                    user.addresses.forEach((a: any) => a.isDefault = false)
                }
                user.addresses.push(newAddress)
            }
            // Explicitly mark as modified just in case
            user.markModified('addresses')
        } else if (address) {
            console.log("Skipping address update because some fields are missing:", address)
        }

        // Apply other updates
        if (name !== undefined) user.name = name
        if (phone !== undefined) user.phone = phone
        if (image !== undefined) user.image = image

        await user.save()

        return NextResponse.json({
            success: true,
            user
        })

    } catch (error: any) {
        console.error("Error updating profile:", error)
        return NextResponse.json({
            error: "Failed to update profile. Please check your input."
        }, { status: 500 })
    }
}
