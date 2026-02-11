import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { z } from "zod"
import db from "@/lib/mongodb"
import { Product } from "@/models/product.model"

const paymentSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().positive(),
  })).min(1, "At least one item is required"),
  currency: z.string().length(3, "Currency must be 3 characters").default("INR"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validationResult = paymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ message: "Validation Error", errors: validationResult.error.format() }, { status: 400 })
    }

    const { items, currency } = validationResult.data

    await db()

    // Calculate total amount server-side
    let totalAmount = 0
    for (const item of items) {
      const product = await Product.findById(item.id)
      if (!product) {
        return NextResponse.json({ message: `Product not found: ${item.id}` }, { status: 404 })
      }
      totalAmount += product.price * item.quantity
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const payment = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // ₹ to paise, using Math.round for safe integer conversion
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Razorpay error:", error)
    return NextResponse.json({ message: "Failed to create Razorpay order" }, { status: 500 })
  }
}
