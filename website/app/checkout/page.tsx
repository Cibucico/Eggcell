import type { Metadata } from 'next'
import { CheckoutForm } from './CheckoutForm'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your GreenLeaf CBD order.',
}

export default function CheckoutPage() {
  return (
    <div className="section-container section-padding">
      <h1 className="text-3xl md:text-4xl text-zinc-900 mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
