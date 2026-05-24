import type { Product } from '@/types';

const categories: { value: Product['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All Hats' },
  { value: 'fascinator', label: 'Fascinators' },
  { value: 'bridal-party', label: 'Bridal Party' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'event', label: 'Events' },
];

interface Props {
  active: string;
  onChange: (value: string) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            active === cat.value
              ? 'bg-charcoal text-white shadow-md'
              : 'bg-white text-charcoal border border-charcoal/20 hover:border-charcoal hover:bg-charcoal/5'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
