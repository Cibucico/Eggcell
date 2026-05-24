import HeroBanner from '@/components/home/HeroBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Link from 'next/link';

const occasions = [
  {
    title: 'Weddings',
    description: 'Bridal fascinators and matching bridal party sets designed for your special day.',
    emoji: '💍',
    category: 'fascinator',
    color: 'bg-blush/10 border-blush/20',
  },
  {
    title: 'Bridal Party',
    description: 'Coordinated wide-brim sets so your whole squad walks in style.',
    emoji: '👰',
    category: 'bridal-party',
    color: 'bg-royal/5 border-royal/20',
  },
  {
    title: 'Traditional',
    description: 'Culturally inspired headwear for lobola ceremonies and celebrations.',
    emoji: '🌿',
    category: 'traditional',
    color: 'bg-champagne/10 border-champagne/20',
  },
  {
    title: 'Events',
    description: 'Church, race days, garden parties — every occasion deserves a great hat.',
    emoji: '🌸',
    category: 'event',
    color: 'bg-charcoal/5 border-charcoal/10',
  },
];

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      {/* Occasions section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-champagne-dark">
            Every Occasion
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal mt-3 mb-4">
            Hats For Every Moment
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {occasions.map((occ) => (
            <Link
              key={occ.category}
              href={`/shop?category=${occ.category}`}
              className={`group rounded-2xl border p-6 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 ${occ.color}`}
            >
              <span className="text-4xl">{occ.emoji}</span>
              <h3 className="font-serif text-xl font-bold text-charcoal group-hover:text-blush-dark transition-colors">
                {occ.title}
              </h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">{occ.description}</p>
              <span className="text-xs font-semibold text-charcoal/40 mt-auto group-hover:text-blush-dark transition-colors">
                Browse →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedProducts />

      {/* Custom order CTA */}
      <section className="bg-charcoal py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-champagne mb-4 inline-block">
            Bespoke Design
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
            Don&apos;t See Exactly{' '}
            <span className="text-blush">What You Want?</span>
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Every hat we make is custom. Tell us your event, your outfit colours, your vibe —
            and we&apos;ll design something just for you.
          </p>
          <a
            href="https://wa.me/27XXXXXXXXX?text=Hi%20Goodies%20Hat%2C%20I%27d%20like%20to%20order%20a%20custom%20hat%20design."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20ba57] transition-all duration-300 text-sm shadow-lg"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Start Your Custom Order
          </a>
        </div>
      </section>
    </>
  );
}
