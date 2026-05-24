'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import OrderForm from '@/components/checkout/OrderForm';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-champagne-dark">
          Almost There
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal mt-2">
          Checkout
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🎩</div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-3">Nothing to checkout</h2>
          <p className="text-charcoal/50 mb-8">Add some hats to your cart first.</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-blush text-charcoal font-semibold rounded-full hover:bg-blush-dark hover:text-white transition-all duration-300 text-sm"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Order form */}
          <OrderForm />

          {/* Order review */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Order Review</h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{item.product.name}</p>
                      <p className="text-xs text-charcoal/50">
                        Size: {item.selectedSize} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold shrink-0">
                      R{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-charcoal/10 flex justify-between font-bold text-charcoal">
                <span>Total</span>
                <span>R{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blush/10 border border-blush/20 rounded-2xl p-5 text-sm text-charcoal/70 leading-relaxed">
              <p className="font-semibold text-blush-dark mb-1">How it works</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Fill in your details and click the WhatsApp button.</li>
                <li>Your order opens pre-filled in WhatsApp.</li>
                <li>We confirm your order and discuss delivery.</li>
                <li>Your hat is crafted and delivered to you. 🎉</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
