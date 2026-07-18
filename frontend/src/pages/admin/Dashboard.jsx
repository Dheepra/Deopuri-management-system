import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '../../auth/useAuth.js';
import { getPendingUsers, approveUser, rejectUser } from '../../services/auth.js';
import { getProfitLoss } from '../../services/profitLoss.js';
import { fetchAllOrders } from '../../services/adminOrders.js';
import { fetchProducts } from '../../services/products.js';
import { getTopCustomers } from '../../services/offers.js';

const inr = (v) =>
  '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const LOW_STOCK = 10;

const CATEGORIES = [
  { key: 'rawMaterialExpense', label: 'Raw Material', color: '#ef4444' },
  { key: 'manufacturingExpense', label: 'Manufacturing', color: '#f97316' },
  { key: 'packagingExpense', label: 'Packaging', color: '#eab308' },
  { key: 'deliveryExpense', label: 'Delivery', color: '#3b82f6' },
  { key: 'salaryExpense', label: 'Salary', color: '#8b5cf6' },
  { key: 'electricityExpense', label: 'Electricity', color: '#22c55e' },
  { key: 'rentExpense', label: 'Rent', color: '#64748b' },
  { key: 'otherExpense', label: 'Other', color: '#ec4899' },
];

const QUICK_ACTIONS = [
  { label: 'Add product', emoji: '➕', to: '/admin/products' },
  { label: 'Collect payment', emoji: '💵', to: '/admin/payments' },
  { label: 'View orders', emoji: '🧾', to: '/admin/orders' },
  { label: 'Profit & Loss', emoji: '📊', to: '/admin/profit-loss' },
];

function Kpi({ emoji, label, value, sub, tint, to }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <span className={`grid h-7 w-7 place-items-center rounded-lg text-sm ${tint}`}>{emoji}</span>
      </div>
      <p className="mt-2 font-display text-xl font-bold text-ink-900">{value}</p>
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

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? 'admin';

  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [rep, ord, prod, users, cust] = await Promise.all([
        getProfitLoss().catch(() => null),
        fetchAllOrders().catch(() => []),
        fetchProducts().catch(() => []),
        getPendingUsers().catch(() => []),
        getTopCustomers('1Y').catch(() => []),
      ]);
      if (!active) return;
      setReport(rep);
      setOrders(ord || []);
      setProducts(prod || []);
      setPendingUsers(users || []);
      setTopCustomers(cust || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      toast.success('User approved & mail sent');
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch { toast.error('Approval failed'); }
  };
  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      toast.success('User rejected');
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    } catch { toast.error('Reject failed'); }
  };

  // ---- Live derived metrics ----
  const orderStats = useMemo(() => {
    const seen = new Set();
    const uniq = (orders || []).filter((o) => {
      const k = o.orderNumber ?? o.id;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const open = uniq.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    const delivered = uniq.filter((o) => o.status === 'DELIVERED');
    let collected = 0, outstanding = 0;
    delivered.forEach((o) => {
      collected += Number(o.paidAmount) || 0;
      outstanding += Number(o.remainingAmount) || 0;
    });
    const recent = [...uniq]
      .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
      .slice(0, 5);
    return { total: uniq.length, open: open.length, delivered: delivered.length, collected, outstanding, recent };
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map();
    (orders || []).forEach((o) => {
      if (!o.productName) return;
      const cur = map.get(o.productName) || { name: o.productName, qty: 0, amount: 0 };
      cur.qty += Number(o.quantity) || 0;
      cur.amount += Number(o.productAmount) || 0;
      map.set(o.productName, cur);
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const lowStock = useMemo(() =>
    (products || [])
      .map((p) => ({ name: p.name, stock: (p.variants || []).reduce((s, v) => s + (Number(v.stock) || 0), 0) }))
      .filter((p) => p.stock <= LOW_STOCK)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5),
  [products]);

  const expenseBreakdown = useMemo(() => {
    if (!report) return [];
    const total = Number(report.totalExpense) || 0;
    return CATEGORIES
      .map((c) => ({ ...c, value: Number(report[c.key] || 0) }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((c) => ({ ...c, pct: total > 0 ? Math.round((c.value / total) * 100) : 0 }));
  }, [report]);

  const isProfit = report?.status === 'PROFIT';
  const netValue = isProfit ? report?.netProfit : report?.netLoss;
  const collectionRate = report && Number(report.totalSales) > 0
    ? Math.round((orderStats.collected / Number(report.totalSales)) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* HEADER + quick actions */}
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Company console</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold text-ink-900">Welcome back, {name} 👋</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
            >
              <span>{a.emoji}</span> {a.label}
            </Link>
          ))}
        </div>
      </header>

      {/* ===== PROFIT & LOSS strip (~40%) — compact, still the focus ===== */}
      <section
        className={`grid gap-5 rounded-3xl border p-5 text-white shadow-card sm:p-6 lg:grid-cols-5 ${
          isProfit
            ? 'border-brand-200 bg-gradient-to-br from-brand-600 via-emerald-600 to-brand-700'
            : 'border-red-200 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700'
        }`}
      >
        {/* Left: headline net figure */}
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            {isProfit ? '✅ Net Profit' : '🔻 Net Loss'} · all time
          </p>
          {loading || !report ? (
            <div className="mt-2 h-10 w-44 animate-pulse rounded-lg bg-white/20" />
          ) : (
            <p className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{inr(netValue)}</p>
          )}
          <p className="mt-1.5 text-xs text-white/80">
            Net margin <span className="font-bold">{report?.netMargin ?? 0}%</span>
            {report ? ` · Gross ${report.grossMargin ?? 0}%` : ''}
          </p>

          {expenseBreakdown.length > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/70">
                <span>Expense split</span>
                <Link to="/admin/expenses" className="underline decoration-white/40 underline-offset-2 hover:text-white">Manage →</Link>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-white/15">
                {expenseBreakdown.map((c) => (
                  <div key={c.key} style={{ width: `${c.pct}%`, backgroundColor: c.color }} title={`${c.label}: ${inr(c.value)}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: 4 P&L stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-3">
          {[
            { l: 'Total Sales', v: report?.totalSales, e: '💰' },
            { l: 'Total Expense', v: report?.totalExpense, e: '🧾' },
            { l: 'Collected', v: orderStats.collected, e: '✅' },
            { l: 'Outstanding', v: orderStats.outstanding, e: '🔴' },
          ].map((m) => (
            <div key={m.l} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="text-[11px] font-semibold text-white/70">{m.e} {m.l}</p>
              <p className="mt-1 text-base font-bold sm:text-lg">{loading ? '—' : inr(m.v)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== KPI tiles (live) ===== */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi emoji="📦" label="Open orders" value={loading ? '—' : orderStats.open} sub={`${orderStats.delivered} delivered`} tint="bg-sky-50 text-sky-700" to="/admin/orders" />
        <Kpi emoji="💵" label="Collected" value={loading ? '—' : inr(orderStats.collected)} sub={`${collectionRate}% of sales`} tint="bg-brand-50 text-brand-700" to="/admin/payments" />
        <Kpi emoji="🔴" label="Outstanding" value={loading ? '—' : inr(orderStats.outstanding)} sub="To collect" tint="bg-rose-50 text-rose-600" to="/admin/payments" />
        <Kpi emoji="🧑‍💼" label="Approvals" value={loading ? '—' : pendingUsers.length} sub="Needs review" tint="bg-amber-50 text-amber-700" />
      </section>

      {/* ===== Approvals (2/3) + Low stock (1/3) ===== */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink-900">🧑‍💼 Pending approvals</h3>
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{pendingUsers.length}</span>
          </div>
          <div className="space-y-2.5">
            {loading ? (
              <p className="py-6 text-center text-sm text-ink-400">Loading…</p>
            ) : pendingUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-400">🎉 No pending users — all caught up.</p>
            ) : (
              pendingUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 text-xs font-bold text-white">
                      {(u.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{u.firstName} {u.lastName}</p>
                      <p className="truncate text-xs text-ink-500">{u.email} · <span className="uppercase tracking-wider">{u.role}</span></p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => handleApprove(u.id)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">Approve</button>
                    <button onClick={() => handleReject(u.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Panel
          title="⚠️ Low stock"
          action={<Link to="/admin/products" className="text-xs font-semibold text-brand-700 hover:underline">Products →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">✅ Stock healthy</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink-800">{p.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      {/* ===== Top products + Top customers + Recent orders ===== */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="🏆 Top products"
          action={<Link to="/admin/products" className="text-xs font-semibold text-brand-700 hover:underline">All →</Link>}
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
                  <span className="shrink-0 text-xs font-semibold text-ink-500">{p.qty} sold</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="⭐ Top customers"
          action={<Link to="/admin/top-customers" className="text-xs font-semibold text-brand-700 hover:underline">All →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : topCustomers.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No data yet</p>
          ) : (
            <ul className="space-y-2.5">
              {topCustomers.slice(0, 5).map((c, i) => (
                <li key={c.userId ?? i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-amber-50 text-xs font-bold text-amber-700">{i + 1}</span>
                    <span className="truncate text-ink-800">{c.shopName || c.userName}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-ink-500">{inr(c.totalPayment)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="🧾 Recent orders"
          action={<Link to="/admin/orders" className="text-xs font-semibold text-brand-700 hover:underline">All →</Link>}
        >
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : orderStats.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No orders yet</p>
          ) : (
            <ul className="space-y-2.5">
              {orderStats.recent.map((o) => (
                <li key={o.orderNumber ?? o.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-semibold text-ink-800">#{o.orderNumber ?? o.id}</span>
                    <span className="ml-1.5 text-xs text-ink-400">{o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : '—'}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink-900">{inr(o.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </motion.div>
  );
}
