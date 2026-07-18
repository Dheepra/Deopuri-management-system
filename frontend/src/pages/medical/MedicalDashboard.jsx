import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProfile } from '../../services/profile.js';
import {
  getMedicalProfitLoss,
  getSales,
  getStock,
  getBills,
  getKhata,
} from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const LOW_STOCK = 10;
const EXPIRY_SOON_DAYS = 30;

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const daysUntil = (d) => {
  if (!d) return null;
  return Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
};

const QUICK_ACTIONS = [
  { label: 'New bill', emoji: '🧾', to: '/medical/billing' },
  { label: 'Record sale', emoji: '➕', to: '/medical/sales' },
  { label: 'Add stock', emoji: '📦', to: '/medical/inventory' },
  { label: 'Khata', emoji: '📒', to: '/medical/khata' },
  { label: 'Day Close', emoji: '🌙', to: '/medical/day-close' },
  { label: 'Profit & Loss', emoji: '📊', to: '/medical/profit-loss' },
];

function Kpi({ emoji, label, value, sub, tint, to }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-xl text-base ${tint}`}>{emoji}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-ink-900">{value}</p>
      {sub != null && <p className="mt-0.5 text-[11px] text-ink-400">{sub}</p>}
    </>
  );
  const cls =
    'block rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover';
  return to ? <Link to={to} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

function Panel({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function MedicalDashboard() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [bills, setBills] = useState([]);
  const [khata, setKhata] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [prof, rep, s, st, b, k] = await Promise.all([
        getProfile().catch(() => null),
        getMedicalProfitLoss().catch(() => null),
        getSales().catch(() => []),
        getStock().catch(() => []),
        getBills().catch(() => []),
        getKhata().catch(() => []),
      ]);
      if (!active) return;
      setProfile(prof);
      setReport(rep);
      setSales(s || []);
      setStock(st || []);
      setBills(b || []);
      setKhata(k || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const name = (profile?.firstName || '').trim() || 'there';
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '🌅' };
    if (h < 17) return { text: 'Good afternoon', emoji: '☀️' };
    return { text: 'Good evening', emoji: '🌙' };
  }, []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  );

  const today = todayLocal();
  const todaySales = useMemo(
    () => sales.filter((s) => s.saleDate === today).reduce((a, s) => a + (Number(s.totalAmount) || 0), 0),
    [sales, today],
  );
  const outstanding = useMemo(() => khata.reduce((a, k) => a + (Number(k.totalDue) || 0), 0), [khata]);
  const stockValue = useMemo(
    () => stock.reduce((a, s) => a + (Number(s.costPrice) || 0) * s.quantity, 0),
    [stock],
  );
  const alerts = useMemo(() => {
    const low = stock.filter((s) => s.quantity <= LOW_STOCK);
    const expiring = stock.filter((s) => {
      const d = daysUntil(s.expiryDate);
      return d != null && d <= EXPIRY_SOON_DAYS;
    });
    return { low, expiring, count: new Set([...low, ...expiring].map((s) => s.id)).size };
  }, [stock]);

  const topProducts = useMemo(() => {
    const map = new Map();
    sales.forEach((s) => {
      const cur = map.get(s.productName) || { name: s.productName, qty: 0, amount: 0 };
      cur.qty += s.quantity;
      cur.amount += Number(s.totalAmount) || 0;
      map.set(s.productName, cur);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [sales]);

  const recentBills = useMemo(
    () => [...bills].sort((a, b) => (b.billNumber || '').localeCompare(a.billNumber || '')).slice(0, 5),
    [bills],
  );

  const isProfit = report?.status === 'PROFIT';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-6 text-white shadow-card sm:p-8">
        <div className="bg-grid-dots absolute inset-0 opacity-20" />
        <div className="animate-mesh pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">💊 Medical Console</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {greeting.text}, {name} {greeting.emoji}
          </h1>
          <p className="mt-1.5 text-sm text-white/80">📅 {todayLabel}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
              💰 {loading ? '—' : inr(todaySales)} sales today
            </span>
            {outstanding > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                📒 {inr(outstanding)} to collect
              </span>
            )}
            {alerts.count > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                ⚠️ {alerts.count} stock alerts
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-ink-100 bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
          >
            <span className="text-xl">{a.emoji}</span>
            <span className="text-[11px] font-semibold text-ink-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi emoji="💰" label="Sales today" value={loading ? '—' : inr(todaySales)} tint="bg-brand-50 text-brand-700" to="/medical/day-close" />
        <Kpi emoji="📦" label="Stock value" value={loading ? '—' : inr(stockValue)} sub={`${stock.length} products`} tint="bg-sky-50 text-sky-700" to="/medical/inventory" />
        <Kpi emoji="📒" label="Outstanding" value={loading ? '—' : inr(outstanding)} sub={`${khata.length} customers`} tint="bg-rose-50 text-rose-600" to="/medical/khata" />
        <Kpi emoji="⚠️" label="Stock alerts" value={loading ? '—' : alerts.count} sub="Low / expiring" tint="bg-amber-50 text-amber-700" to="/medical/inventory" />
      </section>

      {/* P&L snapshot + alerts */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* P&L */}
        <div className={`overflow-hidden rounded-2xl border p-5 text-white shadow-card lg:col-span-2 ${isProfit ? 'border-brand-200 bg-gradient-to-br from-brand-600 via-emerald-600 to-brand-700' : 'border-red-200 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">{isProfit ? '✅ Net Profit' : '🔻 Net Loss'} · all time</p>
              <p className="mt-1 font-display text-3xl font-bold">{loading || !report ? '—' : inr(report.netProfit)}</p>
              <p className="mt-1 text-xs text-white/80">Net margin {report?.netMargin ?? 0}% · Gross {report?.grossMargin ?? 0}%</p>
            </div>
            <Link to="/medical/profit-loss" className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-white/25">Full report →</Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { l: 'Revenue', v: report?.totalSales },
              { l: 'Cost', v: report?.totalCost },
              { l: 'Expenses', v: report?.totalExpense },
            ].map((m) => (
              <div key={m.l} className="rounded-xl bg-white/10 p-2.5 backdrop-blur">
                <p className="text-[10px] font-semibold text-white/70">{m.l}</p>
                <p className="mt-0.5 text-sm font-bold">{loading ? '—' : inr(m.v)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <Panel
          title="⚠️ Stock alerts"
          action={<Link to="/medical/inventory" className="text-xs font-semibold text-brand-700 hover:underline">Manage →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : alerts.low.length === 0 && alerts.expiring.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">✅ Stock is healthy</p>
          ) : (
            <ul className="space-y-2">
              {[...new Map([...alerts.low, ...alerts.expiring].map((s) => [s.id, s])).values()].slice(0, 5).map((s) => {
                const d = daysUntil(s.expiryDate);
                const expSoon = d != null && d <= EXPIRY_SOON_DAYS;
                return (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-ink-800">{s.productName}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.quantity <= LOW_STOCK ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}`}>
                      {s.quantity <= LOW_STOCK ? `${s.quantity} left` : (d < 0 ? 'Expired' : `${d}d to expiry`)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>

      {/* Top products + Recent bills + Khata */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="🏆 Top products"
          action={<Link to="/medical/sales" className="text-xs font-semibold text-brand-700 hover:underline">Sales →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No sales yet</p>
          ) : (
            <ul className="space-y-2.5">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                    <span className="truncate text-ink-800">{p.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-ink-500">{p.qty} · {inr(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="🧾 Recent bills"
          action={<Link to="/medical/billing" className="text-xs font-semibold text-brand-700 hover:underline">All →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : recentBills.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No bills yet</p>
          ) : (
            <ul className="space-y-2.5">
              {recentBills.map((b) => (
                <li key={b.billNumber} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-semibold text-ink-800">{b.billNumber}</span>
                    <span className="ml-1.5 text-xs text-ink-400">{b.customerName || 'Walk-in'}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink-900">
                    {inr(b.totalAmount)}
                    {b.dueAmount > 0 && <span className="ml-1 text-[10px] font-bold text-amber-600">·due</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="📒 Credit (khata)"
          action={<Link to="/medical/khata" className="text-xs font-semibold text-brand-700 hover:underline">All →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : khata.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">🎉 No pending dues</p>
          ) : (
            <ul className="space-y-2.5">
              {khata.slice(0, 5).map((c, i) => (
                <li key={(c.customerMobile || c.customerName || i) + i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink-800">{c.customerName || 'Walk-in'}</span>
                  <span className="shrink-0 font-semibold text-rose-600">{inr(c.totalDue)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </motion.div>
  );
}
