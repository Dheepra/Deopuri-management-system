import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchInput from '../../components/ui/SearchInput.jsx';
import { fetchProducts } from '../../services/products.js';
import { getStock } from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const LOW_STOCK = 10;
const EXPIRY_SOON_DAYS = 30;

const daysUntil = (d) => {
  if (!d) return null;
  return Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
};

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([fetchProducts().catch(() => []), getStock().catch(() => [])]);
      setProducts(p || []);
      setStock(s || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Merge each company product with the medical admin's own stock line (matched by name).
  const rows = useMemo(() => {
    const byName = new Map(stock.map((s) => [s.productName?.toLowerCase(), s]));
    const q = search.trim().toLowerCase();
    return (products || [])
      .filter((p) => !q || p.name?.toLowerCase().includes(q))
      .map((p) => ({ product: p, mine: byName.get(p.name?.toLowerCase()) || null }));
  }, [products, stock, search]);

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Catalog</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">Medicines &amp; my margins</h1>
          <p className="mt-1 text-sm text-ink-500">Company price (your cost) vs your retail — margin, stock and expiry in one place.</p>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search medicine" className="sm:w-72" />
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
          <div className="text-4xl">🔍</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No medicines found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ product: p, mine }) => {
            const cost = mine?.costPrice ?? p.price;
            const retail = mine?.retailPrice;
            const marginPct = mine?.marginPercent;
            const myQty = mine?.quantity ?? null;
            const low = myQty != null && myQty <= LOW_STOCK;
            const d = daysUntil(mine?.expiryDate);
            const expSoon = d != null && d <= EXPIRY_SOON_DAYS;

            return (
              <div key={p.id} className="flex flex-col rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-ink-900">{p.name}</h3>
                    {p.description && <p className="line-clamp-1 text-xs text-ink-500">{p.description}</p>}
                  </div>
                  {myQty != null ? (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${myQty === 0 ? 'bg-red-50 text-red-600' : low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{myQty} in stock</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-ink-50 px-2 py-0.5 text-xs font-semibold text-ink-400">Not stocked</span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Cost" value={inr(cost)} />
                  <MiniStat label="Retail" value={retail != null ? inr(retail) : '—'} tone="text-brand-700" />
                  <MiniStat label="Margin" value={marginPct != null ? `${marginPct}%` : '—'} tone={(mine?.marginPerUnit ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'} />
                </div>

                {(expSoon || low) && (
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {expSoon && <span className="rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-rose-600">⏳ {d < 0 ? 'Expired' : `Expiry ${d}d`}</span>}
                    {low && <span className="rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">⚠️ Low stock</span>}
                  </div>
                )}

                <div className="mt-3 flex gap-2 border-t border-ink-50 pt-3">
                  {myQty ? (
                    <Link to={`/medical/sales?product=${encodeURIComponent(p.name)}`} className="flex-1 rounded-lg bg-brand-600 py-1.5 text-center text-xs font-semibold text-white transition-colors hover:bg-brand-700">🧾 Record sale</Link>
                  ) : (
                    <span className="flex-1 rounded-lg bg-ink-50 py-1.5 text-center text-xs font-semibold text-ink-400">No stock</span>
                  )}
                  <Link to="/medical/orders" className={`flex-1 rounded-lg border py-1.5 text-center text-xs font-semibold transition-colors ${low ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}>🔁 Reorder</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MiniStat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-lg bg-ink-50/70 py-1.5">
      <p className="text-[10px] font-semibold uppercase text-ink-400">{label}</p>
      <p className={`text-xs font-bold ${tone}`}>{value}</p>
    </div>
  );
}
