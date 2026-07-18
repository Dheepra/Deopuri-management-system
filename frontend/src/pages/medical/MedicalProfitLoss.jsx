import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMedicalProfitLoss } from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

function StatCard({ emoji, label, value, sub, tone = 'ink' }) {
  const tones = { ink: 'text-ink-900', green: 'text-brand-700', red: 'text-red-600', blue: 'text-blue-700', amber: 'text-amber-600' };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-500"><span>{emoji}</span>{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
      {sub != null && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export default function MedicalProfitLoss() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async (f, t) => {
    setLoading(true);
    try {
      setReport(await getMedicalProfitLoss(f || undefined, t || undefined));
    } catch {
      toast.error('Could not load Profit & Loss');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProfit = report?.status === 'PROFIT';

  const suggestions = useMemo(() => {
    if (!report) return [];
    const s = [];
    if (report.totalSales === 0) {
      s.push('🧾 No sales recorded yet — add sales on the Sales page to build your P&L.');
    }
    if (report.grossMargin > 0 && report.grossMargin < 15) {
      s.push(`📉 Gross margin only ${report.grossMargin}% — raise your retail prices a bit or source cheaper stock.`);
    }
    if (report.totalExpense > report.grossProfit && report.grossProfit > 0) {
      s.push('⚠️ Expenses exceed gross profit — cut costs to avoid a net loss.');
    }
    if (report.stockValue > 0 && report.totalSales < report.stockValue) {
      s.push(`📦 ${inr(report.stockValue)} of stock sitting idle while sales are lower — focus on fast-selling items.`);
    }
    if (isProfit && report.netProfit > 0) {
      s.push(`✅ Net profit ${inr(report.netProfit)} (${report.netMargin}% margin) — going strong! 🎉`);
    }
    if (s.length === 0) s.push('✅ Everything looks healthy.');
    return s;
  }, [report, isProfit]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">📊 My Profit &amp; Loss</h1>
          <p className="text-sm text-ink-500">Sales − stock cost − expenses. Your numbers only.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-ink-500"><span className="mb-1 block">📅 From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="text-xs font-semibold text-ink-500"><span className="mb-1 block">📅 To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </label>
          <button onClick={() => load(from, to)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">✨ Apply</button>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); load(); }} className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50">All time</button>
          )}
        </div>
      </div>

      {loading || !report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-100" />)}
        </div>
      ) : (
        <>
          {/* Hero net */}
          <div className={`overflow-hidden rounded-3xl border p-6 text-white shadow-card ${isProfit ? 'border-brand-200 bg-gradient-to-br from-brand-600 via-emerald-600 to-brand-700' : 'border-red-200 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{isProfit ? '✅ Net Profit' : '🔻 Net Loss'}</p>
                <p className="mt-1 font-display text-4xl font-bold tracking-tight">{inr(report.netProfit)}</p>
                <p className="mt-1.5 text-sm text-white/80">Net margin <span className="font-bold">{report.netMargin}%</span> · Gross {report.grossMargin}%</p>
              </div>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">{isProfit ? '📈 In profit' : '📉 In loss'}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: 'Revenue (sales)', v: report.totalSales, e: '💰' },
                { l: 'Cost of goods', v: report.totalCost, e: '📦' },
                { l: 'Expenses', v: report.totalExpense, e: '🧮' },
                { l: 'Gross profit', v: report.grossProfit, e: '📈' },
              ].map((m) => (
                <div key={m.l} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <p className="text-[11px] font-semibold text-white/70">{m.e} {m.l}</p>
                  <p className="mt-1 text-lg font-bold">{inr(m.v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard emoji="📦" label="Stock value (cost)" value={inr(report.stockValue)} sub="Abhi inventory me" tone="blue" />
            <StatCard emoji="🛒" label="Total purchases" value={inr(report.totalPurchases)} sub="Spent on stock (approx)" tone="amber" />
            <StatCard emoji="🧾" label="Sales count" value={report.salesCount} sub={`${report.itemsSold} items sold`} tone="ink" />
            <StatCard emoji={isProfit ? '✅' : '🔻'} label={isProfit ? 'Net profit' : 'Net loss'} value={inr(report.netProfit)} sub={`${report.netMargin}% margin`} tone={isProfit ? 'green' : 'red'} />
          </div>

          {/* Suggestions */}
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900">💡 Suggestions</h3>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl bg-ink-50/60 px-3 py-2 text-sm text-ink-700">{s}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/medical/sales" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">➕ Record a sale</Link>
              <Link to="/medical/inventory" className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">📦 Manage stock</Link>
              <Link to="/medical/expenses" className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">🧮 Add expense</Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
