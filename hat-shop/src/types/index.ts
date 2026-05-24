export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'fascinator' | 'bridal-party' | 'traditional' | 'event';
  price: number;
  description: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
}
