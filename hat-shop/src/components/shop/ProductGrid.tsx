import type { Product } from '@/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-charcoal/50">
        <p className="text-lg">No hats found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
