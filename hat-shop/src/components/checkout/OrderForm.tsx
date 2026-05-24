'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { OrderFormData } from '@/types';

export default function OrderForm() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<OrderFormData>({ name: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill in all fields before submitting.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    const url = buildWhatsAppUrl(items, form);
    window.open(url, '_blank');
    clearCart();
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-serif text-3xl font-bold text-charcoal mb-3">Order Sent!</h2>
        <p className="text-charcoal/70 mb-6">
          Your order has been sent to WhatsApp. We&apos;ll confirm your hat design and delivery details shortly.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-blush text-charcoal font-semibold rounded-full hover:bg-blush-dark hover:text-white transition-all duration-300 text-sm"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-6">
      <h2 className="font-serif text-2xl font-bold text-charcoal">Your Details</h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-charcoal" htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Dlamini"
          className="border border-charcoal/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blush transition"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-charcoal" htmlFor="phone">
          Phone / WhatsApp Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="083 123 4567"
          className="border border-charcoal/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blush transition"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-charcoal" htmlFor="address">
          Delivery Address
        </label>
        <textarea
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="12 Main Street, Johannesburg, 2000"
          rows={3}
          className="border border-charcoal/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blush transition resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <button
        type="submit"
        className="flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20ba57] transition-all duration-300 text-sm tracking-wide shadow-md"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Place Order via WhatsApp
      </button>

      <p className="text-xs text-charcoal/40 text-center">
        Clicking this button will open WhatsApp with your order pre-filled. We&apos;ll confirm your order and arrange delivery.
      </p>
    </form>
  );
}
