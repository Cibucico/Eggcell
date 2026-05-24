'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

export default function CartPage() {
  const { items, subtotal } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-champagne-dark">
          Your Selection
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal mt-2">
          Shopping Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🎩</div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-3">Your cart is empty</h2>
          <p className="text-charcoal/50 mb-8">Find a hat you love and add it here.</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-blush text-charcoal font-semibold rounded-full hover:bg-blush-dark hover:text-white transition-all duration-300 text-sm"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <CartItem key={`${item.product.id}-${item.selectedSize}`} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div>
            <CartSummary subtotal={subtotal} />
          </div>
        </div>
      )}
    </div>
  );
}
