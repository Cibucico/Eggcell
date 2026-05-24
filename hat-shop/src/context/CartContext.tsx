'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; size: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string } }
  | { type: 'UPDATE_QTY'; payload: { productId: string; size: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size } = action.payload;
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.selectedSize === size
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id && i.selectedSize === size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1, selectedSize: size }] };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (i) => !(i.product.id === action.payload.productId && i.selectedSize === action.payload.size)
        ),
      };
    case 'UPDATE_QTY': {
      const { productId, size, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.selectedSize === size)
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId && i.selectedSize === size ? { ...i, quantity } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.payload };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('goodies-cart');
      if (stored) dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) });
    } catch {
      // ignore malformed stored data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('goodies-cart', JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        addItem: (product, size) => dispatch({ type: 'ADD_ITEM', payload: { product, size } }),
        removeItem: (productId, size) => dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } }),
        updateQty: (productId, size, quantity) =>
          dispatch({ type: 'UPDATE_QTY', payload: { productId, size, quantity } }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
