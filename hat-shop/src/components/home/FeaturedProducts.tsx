import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/products';
import ProductCard from '@/components/shop/ProductCard';

export default function FeaturedProducts() {
  const featured = getFeaturedProducts();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-champagne-dark">
          Handpicked For You
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal mt-3 mb-4">
          Featured Collection
        </h2>
        <p className="text-charcoal/60 max-w-lg mx-auto text-sm leading-relaxed">
          Each hat is individually crafted with premium materials. Browse our most loved designs.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Link
          href="/shop"
          className="inline-block px-8 py-3 border-2 border-charcoal text-charcoal font-semibold rounded-full hover:bg-charcoal hover:text-white transition-all duration-300 text-sm tracking-wide"
        >
          View Full Collection
        </Link>
      </div>
    </section>
  );
}
