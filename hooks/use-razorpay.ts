'use client'

import { useCallback } from 'react'

interface RazorpayOptions {
    amount: number
    currency: string
    name?: string
    description?: string
    image?: string
    order_id: string
    prefill?: {
        name?: string
        email?: string
        contact?: string
    }
    notes?: Record<string, string>
    theme?: {
        color?: string
    }
}

export const useRazorpay = () => {
    const loadScript = useCallback((src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = () => {
                resolve(true)
            }
            script.onerror = () => {
                resolve(false)
            }
            document.body.appendChild(script)
        })
    }, [])

    const displayRazorpay = useCallback(async (options: RazorpayOptions, onSuccess: (response: any) => void) => {
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?')
            return
        }

        const rzpOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: options.amount,
            currency: options.currency,
            name: options.name || 'EcoSaro',
            description: options.description || 'Secure Payment',
            image: options.image || '/logo.svg', // Updated to logo.svg
            order_id: options.order_id,
            handler: function (response: any) {
                onSuccess(response)
            },
            prefill: options.prefill,
            notes: options.notes,
            theme: {
                color: options.theme?.color || '#10b981', // emerald-500
            },
        }

        const paymentObject = new (window as any).Razorpay(rzpOptions)
        paymentObject.open()
    }, [loadScript])

    return { displayRazorpay }
}
