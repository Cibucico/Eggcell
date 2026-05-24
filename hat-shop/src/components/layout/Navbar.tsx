'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-charcoal text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-blush tracking-wide">
              Goodies Hat
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-blush transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-blush transition-colors">
              Shop
            </Link>
            <Link href="/shop?category=bridal-party" className="hover:text-blush transition-colors">
              Bridal
            </Link>
            <Link href="/shop?category=traditional" className="hover:text-blush transition-colors">
              Traditional
            </Link>
          </nav>

          {/* Cart + mobile toggle */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 hover:text-blush transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blush text-charcoal text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:text-blush transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden bg-charcoal border-t border-white/10 px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
          <Link href="/" className="py-2 hover:text-blush transition-colors" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/shop" className="py-2 hover:text-blush transition-colors" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/shop?category=bridal-party" className="py-2 hover:text-blush transition-colors" onClick={() => setMenuOpen(false)}>
            Bridal
          </Link>
          <Link href="/shop?category=traditional" className="py-2 hover:text-blush transition-colors" onClick={() => setMenuOpen(false)}>
            Traditional
          </Link>
        </nav>
      )}
    </header>
  );
}
