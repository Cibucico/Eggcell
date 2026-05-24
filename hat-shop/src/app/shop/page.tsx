'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProducts } from '@/lib/products';
import type { Product } from '@/types';
import ProductGrid from '@/components/shop/ProductGrid';
import CategoryFilter from '@/components/shop/CategoryFilter';
import SortDropdown from '@/components/shop/SortDropdown';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'featured'>('featured');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const all = getAllProducts();

  const filtered =
    activeCategory === 'all' ? all : all.filter((p) => p.category === activeCategory);

  const sorted: Product[] = [...filtered].sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;
    if (sortOrder === 'desc') return b.price - a.price;
    return Number(b.featured) - Number(a.featured);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-champagne-dark">
          Browse
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal mt-2 mb-2">
          The Collection
        </h1>
        <p className="text-charcoal/50 text-sm">
          {sorted.length} {sorted.length === 1 ? 'hat' : 'hats'} found
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        <SortDropdown value={sortOrder} onChange={setSortOrder} />
      </div>

      <ProductGrid products={sorted} />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-charcoal/50">
          Loading collection…
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
