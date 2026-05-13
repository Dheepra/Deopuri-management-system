export default function ProductCard({ product }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-ink-100 backdrop-blur">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
          {product.category}
        </p>
        <h3 className="font-display text-lg font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-display text-xl font-bold text-ink-900">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-colors hover:bg-brand-600 hover:text-white"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
