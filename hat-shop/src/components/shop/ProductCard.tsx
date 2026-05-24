'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const categoryLabels: Record<Product['category'], string> = {
  fascinator: 'Fascinator',
  'bridal-party': 'Bridal Party',
  traditional: 'Traditional',
  event: 'Event',
};

const categoryColors: Record<Product['category'], string> = {
  fascinator: 'bg-blush/20 text-rose-dark',
  'bridal-party': 'bg-royal/10 text-royal',
  traditional: 'bg-champagne/20 text-champagne-dark',
  event: 'bg-charcoal/10 text-charcoal',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const defaultSize = product.sizes[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-charcoal font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`self-start text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryColors[product.category]}`}>
          {categoryLabels[product.category]}
        </span>

        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif font-semibold text-charcoal leading-snug hover:text-blush-dark transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-charcoal">R{product.price.toLocaleString()}</span>
          <button
            onClick={() => product.inStock && addItem(product, defaultSize)}
            disabled={!product.inStock}
            className="text-xs font-semibold px-4 py-2 bg-blush text-charcoal rounded-full hover:bg-blush-dark hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
