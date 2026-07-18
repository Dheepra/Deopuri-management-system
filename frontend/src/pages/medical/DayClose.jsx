import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSales, getMedicalExpenses, getBills } from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function DayClose() {
  const [date, setDate] = useState(todayLocal());
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, e, b] = await Promise.all([
        getSales(),
        getMedicalExpenses().catch(() => []),
        getBills().catch(() => []),
      ]);
      setSales(s || []);
      setExpenses(e || []);
      setBills(b || []);
    } catch {
      toast.error('Could not load day report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const day = useMemo(() => {
    const daySales = sales.filter((s) => s.saleDate === date);
    const dayExp = expenses.filter((e) => e.expenseDate === date);

    const revenue = daySales.reduce((a, s) => a + (Number(s.totalAmount) || 0), 0);
    const profit = daySales.reduce((a, s) => a + (Number(s.profit) || 0), 0);
    const cogs = revenue - profit;
    const items = daySales.reduce((a, s) => a + s.quantity, 0);
    const expTotal = dayExp.reduce((a, e) => a + (Number(e.amount) || 0), 0);
    const billCount = new Set(daySales.map((s) => s.billNumber).filter(Boolean)).size;
    const quick = daySales.filter((s) => !s.billNumber).length;

    // Top products of the day
    const map = new Map();
    daySales.forEach((s) => {
      const cur = map.get(s.productName) || { name: s.productName, qty: 0, amount: 0 };
      cur.qty += s.quantity;
      cur.amount += Number(s.totalAmount) || 0;
      map.set(s.productName, cur);
    });
    const top = [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 6);

    // Cash vs credit: today's bills that were left partly unpaid become credit.
    const dayDue = bills.filter((b) => b.billDate === date).reduce((a, b) => a + (Number(b.dueAmount) || 0), 0);
    const cash = Math.max(0, revenue - dayDue);

    return { revenue, profit, cogs, items, expTotal, net: profit - expTotal, bills: billCount, quick, top, expenses: dayExp, txns: daySales.length, dayDue, cash };
  }, [sales, expenses, bills, date]);

  const isProfit = day.net >= 0;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">🌙 Day Close</h1>
          <p className="text-sm text-ink-500">The whole day in one place — sales, profit, cash and expenses.</p>
        </div>
        <div className="flex items-end gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          <button onClick={() => setDate(todayLocal())} className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50">Today</button>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
      ) : (
        <>
          {/* Hero */}
          <div className={`overflow-hidden rounded-3xl border p-6 text-white shadow-card ${isProfit ? 'border-brand-200 bg-gradient-to-br from-brand-600 via-emerald-600 to-brand-700' : 'border-red-200 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · Net {isProfit ? 'profit' : 'loss'}</p>
                <p className="mt-1 font-display text-4xl font-bold tracking-tight">{inr(day.net)}</p>
                <p className="mt-1.5 text-sm text-white/80">{day.txns} transactions · {day.items} items sold</p>
              </div>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">{isProfit ? '📈 Good day' : '📉 Loss'}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: 'Sales (billed)', v: day.revenue, e: '💰' },
                { l: 'Cost of goods', v: day.cogs, e: '📦' },
                { l: 'Gross profit', v: day.profit, e: '📈' },
                { l: 'Expenses', v: day.expTotal, e: '🧮' },
              ].map((m) => (
                <div key={m.l} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <p className="text-[11px] font-semibold text-white/70">{m.e} {m.l}</p>
                  <p className="mt-1 text-lg font-bold">{inr(m.v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cash vs credit */}
          <div className="grid grid-cols-2 gap-3">
            <Kpi emoji="💵" label="Cash collected" value={inr(day.cash)} tint="bg-emerald-50 text-emerald-700" />
            <Kpi emoji="📒" label="Credit (dues)" value={inr(day.dayDue)} tint="bg-rose-50 text-rose-600" />
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi emoji="🧾" label="Bills" value={day.bills} tint="bg-sky-50 text-sky-700" />
            <Kpi emoji="⚡" label="Quick sales" value={day.quick} tint="bg-amber-50 text-amber-700" />
            <Kpi emoji="📦" label="Items sold" value={day.items} tint="bg-brand-50 text-brand-700" />
            <Kpi emoji="🧮" label="Expenses" value={day.expenses.length} tint="bg-rose-50 text-rose-600" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top products */}
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-display text-sm font-bold text-ink-900">🏆 Top products today</h3>
              {day.top.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No sales today</p>
              ) : (
                <ul className="space-y-2.5">
                  {day.top.map((p, i) => (
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
            </div>

            {/* Expenses today */}
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-display text-sm font-bold text-ink-900">🧮 Today's expenses</h3>
              {day.expenses.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-400">No expenses today</p>
              ) : (
                <ul className="space-y-2">
                  {day.expenses.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-ink-800">{e.expenseName} <span className="text-xs text-ink-400">· {e.expenseType || 'Other'}</span></span>
                      <span className="shrink-0 font-semibold text-rose-600">{inr(e.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/medical/billing" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">🧾 New bill</Link>
            <Link to="/medical/expenses" className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">🧮 Add expense</Link>
            <Link to="/medical/profit-loss" className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">📊 Full P&amp;L</Link>
          </div>
        </>
      )}
    </section>
  );
}

function Kpi({ emoji, label, value, tint }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <span className={`grid h-7 w-7 place-items-center rounded-lg text-sm ${tint}`}>{emoji}</span>
      </div>
      <p className="mt-2 font-display text-xl font-bold text-ink-900">{value}</p>
    </div>
  );
}
