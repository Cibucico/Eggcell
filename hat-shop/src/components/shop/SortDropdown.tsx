interface Props {
  value: 'asc' | 'desc' | 'featured';
  onChange: (value: 'asc' | 'desc' | 'featured') => void;
}

export default function SortDropdown({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'asc' | 'desc' | 'featured')}
      className="text-sm border border-charcoal/20 rounded-full px-4 py-2 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-blush cursor-pointer"
    >
      <option value="featured">Featured</option>
      <option value="asc">Price: Low to High</option>
      <option value="desc">Price: High to Low</option>
    </select>
  );
}
