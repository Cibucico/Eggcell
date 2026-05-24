import productsData from '@/data/products.json';
import type { Product } from '@/types';

const products: Product[] = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return products;
  return products.filter((p) => p.category === category);
}
