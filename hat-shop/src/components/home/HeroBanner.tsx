import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A0812] via-[#2D1625] to-[#0D1520] opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-blush/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-champagne/5 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-royal/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-5xl mx-auto">
        {/* Tag */}
        <span className="inline-block text-xs font-semibold tracking-[0.3em] uppercase text-champagne mb-6 border border-champagne/30 px-4 py-1.5 rounded-full">
          Bespoke Hat Design · South Africa
        </span>

        {/* Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6">
          Let&apos;s Design{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blush via-blush-light to-champagne">
            You A Hat.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Custom-crafted fascinators and wide-brim hats for weddings, bridal parties,
          traditional ceremonies, and special events that deserve to be remembered.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="px-8 py-4 bg-blush text-charcoal font-semibold rounded-full hover:bg-blush-dark hover:text-white transition-all duration-300 text-sm tracking-wide shadow-lg hover:shadow-blush/30 hover:shadow-xl"
          >
            Shop Collection
          </Link>
          <a
            href="https://wa.me/27XXXXXXXXX?text=Hi%20Goodies%20Hat%2C%20I%27d%20like%20to%20enquire%20about%20a%20custom%20hat%20design."
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:border-champagne hover:text-champagne transition-all duration-300 text-sm tracking-wide"
          >
            Custom Order via WhatsApp
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center">
          {[
            { value: '500+', label: 'Hats Designed' },
            { value: '100%', label: 'Custom Made' },
            { value: '5★', label: 'Client Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-3xl font-bold text-blush">{stat.value}</div>
              <div className="text-xs text-white/50 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
    </section>
  );
}
