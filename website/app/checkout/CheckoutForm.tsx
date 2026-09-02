'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Leaf, Lock } from 'lucide-react'
import Link from 'next/link'

function formatCents(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}

interface Fields {
  firstName: string
  lastName: string
  email: string
}

export function CheckoutForm() {
  const { items, totalCents } = useCart()
  const [fields, setFields] = useState<Fields>({ firstName: '', lastName: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        <Leaf size={60} strokeWidth={1} className="text-brand-200" />
        <p className="text-zinc-500">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!fields.firstName || !fields.lastName || !fields.email) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, items }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to initiate checkout.')
      }

      const { redirectUrl, formData } = await res.json()

      // Build and auto-submit the PayFast form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = redirectUrl

      Object.entries(formData as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-zinc-900">Your Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={fields.firstName}
                onChange={(e) => setFields((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="Thabo"
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={fields.lastName}
                onChange={(e) => setFields((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Nkosi"
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={fields.email}
              onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
              placeholder="thabo@example.com"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              required
            />
            <p className="mt-1.5 text-xs text-zinc-400">
              Your order confirmation and receipt will be sent here.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 text-base transition-colors"
        >
          <Lock size={16} />
          {loading ? 'Redirecting to PayFast…' : `Pay ${formatCents(totalCents)} securely`}
        </button>

        <p className="text-xs text-center text-zinc-400 flex items-center justify-center gap-1.5">
          <Lock size={11} />
          Payments are processed securely by PayFast. We never see your card details.
        </p>
      </form>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl bg-brand-50 border border-brand-100 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 text-lg">Order Summary</h2>
          <div className="space-y-2 text-sm text-zinc-600">
            {items.map(({ product, quantity }) => (
              <div key={product.slug} className="flex justify-between gap-2">
                <span className="truncate">{product.name} × {quantity}</span>
                <span className="font-medium text-zinc-800 flex-shrink-0">
                  {formatCents(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-200 pt-3 flex justify-between font-bold text-zinc-900">
            <span>Total</span>
            <span className="text-brand-700 text-lg">{formatCents(totalCents)}</span>
          </div>
          <Link href="/cart" className="block text-sm text-center text-brand-600 hover:underline">
            ← Edit cart
          </Link>
        </div>
      </div>
    </div>
  )
}
