'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const categoryLabels: Record<Product['category'], string> = {
  fascinator: 'Fascinator',
  'bridal-party': 'Bridal Party',
  traditional: 'Traditional',
  event: 'Event',
};

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    if (!product.inStock) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-charcoal/50 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blush transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-blush transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-champagne-dark mb-3">
            {categoryLabels[product.category]}
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="text-3xl font-bold text-charcoal mb-6">
            R{product.price.toLocaleString()}
          </div>

          <p className="text-charcoal/70 leading-relaxed mb-8">{product.description}</p>

          {/* Size selector */}
          {product.sizes.length > 1 && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-charcoal mb-3 uppercase tracking-wide">
                Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-charcoal bg-charcoal text-white'
                        : 'border-charcoal/20 text-charcoal hover:border-charcoal'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`flex-1 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 ${
                added
                  ? 'bg-green-500 text-white'
                  : product.inStock
                  ? 'bg-blush text-charcoal hover:bg-blush-dark hover:text-white shadow-lg hover:shadow-blush/30 hover:shadow-xl'
                  : 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
              }`}
            >
              {added ? '✓ Added to Cart' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <Link
              href="/cart"
              className="flex-1 py-4 rounded-full font-semibold text-sm tracking-wide border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-all duration-300 text-center"
            >
              View Cart
            </Link>
          </div>

          {/* Custom note */}
          <div className="mt-8 p-5 rounded-2xl bg-blush/10 border border-blush/20">
            <p className="text-sm text-charcoal/80 leading-relaxed">
              <span className="font-semibold text-blush-dark">Want a custom design?</span>{' '}
              Each hat can be customised in your colours and style.{' '}
              <a
                href="https://wa.me/27XXXXXXXXX?text=Hi%20Goodies%20Hat%2C%20I%27m%20interested%20in%20a%20custom%20version%20of%20the%20{product.name}"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-royal underline hover:no-underline"
              >
                Chat to us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
