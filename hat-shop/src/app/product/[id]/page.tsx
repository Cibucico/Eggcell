import { notFound } from 'next/navigation';
import { getProductById, getAllProducts } from '@/lib/products';
import ProductDetail from '@/components/product/ProductDetail';

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
