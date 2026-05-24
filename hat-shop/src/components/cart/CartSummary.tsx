import Link from 'next/link';

interface Props {
  subtotal: number;
}

export default function CartSummary({ subtotal }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
      <h2 className="font-serif text-2xl font-bold text-charcoal">Order Summary</h2>

      <div className="flex justify-between text-sm text-charcoal/70">
        <span>Subtotal</span>
        <span>R{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm text-charcoal/70">
        <span>Delivery</span>
        <span className="text-champagne-dark font-medium">Quoted on checkout</span>
      </div>

      <div className="border-t border-charcoal/10 pt-4 flex justify-between font-bold text-charcoal">
        <span>Total</span>
        <span>R{subtotal.toLocaleString()}</span>
      </div>

      <Link
        href="/checkout"
        className="block text-center py-4 bg-blush text-charcoal font-semibold rounded-full hover:bg-blush-dark hover:text-white transition-all duration-300 text-sm tracking-wide shadow-md"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/shop"
        className="block text-center text-sm text-charcoal/50 hover:text-blush-dark transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
