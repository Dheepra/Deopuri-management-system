export default function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <label
      className={`group flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 transition-all focus-within:border-brand-400 focus-within:shadow-[0_0_0_4px_rgba(31,155,110,0.10)] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-ink-400 group-focus-within:text-brand-600"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
    </label>
  );
}
