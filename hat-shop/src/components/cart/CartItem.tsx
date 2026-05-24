'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQty, removeItem } = useCart();
  const { product, quantity, selectedSize } = item;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif font-semibold text-charcoal hover:text-blush-dark transition-colors truncate">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-charcoal/50 mt-0.5">Size: {selectedSize}</p>
        <p className="font-bold text-charcoal mt-1">R{product.price.toLocaleString()}</p>
      </div>

      {/* Qty + remove */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <button
          onClick={() => removeItem(product.id, selectedSize)}
          className="text-charcoal/30 hover:text-red-400 transition-colors text-xs"
          aria-label="Remove item"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border border-charcoal/20 rounded-full px-3 py-1">
          <button
            onClick={() => updateQty(product.id, selectedSize, quantity - 1)}
            className="text-charcoal hover:text-blush-dark transition-colors font-bold text-base w-5 text-center"
          >
            −
          </button>
          <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
          <button
            onClick={() => updateQty(product.id, selectedSize, quantity + 1)}
            className="text-charcoal hover:text-blush-dark transition-colors font-bold text-base w-5 text-center"
          >
            +
          </button>
        </div>

        <p className="text-sm font-bold text-charcoal">
          R{(product.price * quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
