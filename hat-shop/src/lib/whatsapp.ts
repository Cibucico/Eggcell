import type { CartItem, OrderFormData } from '@/types';

const WHATSAPP_NUMBER = '27XXXXXXXXX'; // Replace with real WhatsApp number

export function buildWhatsAppUrl(items: CartItem[], form: OrderFormData): string {
  const orderLines = items
    .map((item) => {
      const lineTotal = item.product.price * item.quantity;
      return `• ${item.product.name} (Size: ${item.selectedSize}) × ${item.quantity} — R${lineTotal}`;
    })
    .join('\n');

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const message = [
    '🛍️ *New Order — Goodies Hat*',
    '',
    `*Name:* ${form.name}`,
    `*Phone:* ${form.phone}`,
    `*Delivery Address:* ${form.address}`,
    '',
    '*Order Details:*',
    orderLines,
    '---',
    `*TOTAL: R${subtotal}*`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
