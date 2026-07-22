import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getProfitLoss } from "../../services/profitLoss";
import { fetchAllOrders } from "../../services/adminOrders";
import { downloadCsv } from "../../utils/exportCsv.js";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SLICE_COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6", "#22c55e", "#64748b", "#ec4899"];

const inr = (v) =>
  "₹ " + Number(v ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const CATEGORIES = [
  { key: "rawMaterialExpense", label: "Raw Material", emoji: "🌿", tint: "bg-red-50 text-red-600" },
  { key: "manufacturingExpense", label: "Manufacturing", emoji: "🏭", tint: "bg-orange-50 text-orange-600" },
  { key: "packagingExpense", label: "Packaging", emoji: "📦", tint: "bg-yellow-50 text-yellow-700" },
  { key: "deliveryExpense", label: "Delivery", emoji: "🚚", tint: "bg-blue-50 text-blue-600" },
  { key: "salaryExpense", label: "Salary", emoji: "👥", tint: "bg-purple-50 text-purple-600" },
  { key: "electricityExpense", label: "Electricity", emoji: "⚡", tint: "bg-emerald-50 text-emerald-600" },
  { key: "rentExpense", label: "Rent", emoji: "🏠", tint: "bg-slate-100 text-slate-700" },
  { key: "otherExpense", label: "Other", emoji: "🧾", tint: "bg-pink-50 text-pink-600" },
];

const fmtDay = (d) => (d && d !== "—" ? new Date(d).toLocaleDateString("en-IN") : "—");

function StatCard({ emoji, label, value, sub, tone = "ink", delay = 0 }) {
  const tones = {
    ink: "text-ink-900",
    green: "text-brand-700",
    red: "text-red-600",
    blue: "text-blue-700",
    amber: "text-amber-600",
  };
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-500">
        <span>{emoji}</span> {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
      {sub != null && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export default function ProfitLoss() {
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const load = async (f, t) => {
    setLoading(true);
    try {
      const [data, allOrders] = await Promise.all([
        getProfitLoss(f || undefined, t || undefined),
        fetchAllOrders().catch(() => []),
      ]);
      setReport(data);
      setOrders(allOrders || []);
      setAppliedFrom(f || "");
      setAppliedTo(t || "");
    } catch (err) {
      console.log(err);
      toast.error("Failed to load Profit & Loss report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieData = useMemo(
    () =>
      report
        ? CATEGORIES.map((c) => ({ name: c.label, value: Number(report[c.key] ?? 0) })).filter(
            (d) => d.value > 0,
          )
        : [],
    [report],
  );

  // Cash side: what was actually delivered/billed vs collected vs still outstanding, in the applied
  // range. Computed from delivered orders (one row per order number). paidAmount is attributed to the
  // order's date (true payment-date breakdown would need each payment's history).
  const cash = useMemo(() => {
    const inRange = (iso) => {
      if (!appliedFrom && !appliedTo) return true;
      if (!iso) return false;
      const d = iso.split("T")[0];
      if (appliedFrom && d < appliedFrom) return false;
      if (appliedTo && d > appliedTo) return false;
      return true;
    };

    const seen = new Set();
    const delivered = (orders || [])
      .filter((o) => o.status === "DELIVERED" && inRange(o.orderDate))
      .filter((o) => {
        if (seen.has(o.orderNumber)) return false;
        seen.add(o.orderNumber);
        return true;
      });

    let billed = 0, collected = 0, outstanding = 0;
    const byDay = new Map();
    delivered.forEach((o) => {
      const b = Number(o.totalAmount) || 0;
      const p = Number(o.paidAmount) || 0;
      const r = Number(o.remainingAmount) || 0;
      billed += b; collected += p; outstanding += r;
      const key = o.orderDate ? o.orderDate.split("T")[0] : "—";
      const cur = byDay.get(key) || { date: key, billed: 0, collected: 0, outstanding: 0, orders: 0 };
      cur.billed += b; cur.collected += p; cur.outstanding += r; cur.orders += 1;
      byDay.set(key, cur);
    });

    const days = [...byDay.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
    const collectionRate = billed > 0 ? Math.round((collected / billed) * 1000) / 10 : 0;
    return { billed, collected, outstanding, days, count: delivered.length, collectionRate };
  }, [orders, appliedFrom, appliedTo]);

  const isProfit = report?.status === "PROFIT";
  const totalExpense = Number(report?.totalExpense ?? 0);
  const cashProfit = cash.collected - totalExpense; // real cash-in-hand profit
  const cashIsProfit = cashProfit >= 0;

  // Dynamic, data-driven suggestions.
  const suggestions = useMemo(() => {
    if (!report) return [];
    const s = [];
    if (cash.outstanding > 0) {
      s.push(`💰 ₹${cash.outstanding.toLocaleString("en-IN")} abhi collect karna baaki hai — customers se follow-up karo (Collect payment in Payments).`);
    }
    if (cash.billed > 0 && cash.collectionRate < 80) {
      s.push(`⚠️ Collection rate sirf ${cash.collectionRate}% hai — udhaar zyada ja raha hai, cash flow pe dhyaan do.`);
    }
    if (Number(report.netMargin) < 10) {
      s.push(`📉 Net margin ${report.netMargin}% (patla) — pricing thodi badhao ya expense ghatao.`);
    }
    const top = [...CATEGORIES]
      .map((c) => ({ label: c.label, emoji: c.emoji, v: Number(report[c.key] || 0) }))
      .sort((a, b) => b.v - a.v)[0];
    if (top && top.v > 0) {
     s.push(`${top.emoji} "${top.label}" is your largest expense (${inr(top.v)}). Optimizing this cost can improve your profit margin.`);
    }
    if (isProfit && !cashIsProfit) {
      s.push(`🧠 Paper pe PROFIT hai par cash me nahi — bahut sara paisa abhi collect nahi hua. Pehle udhaar wasoolo.`);
    }
    if (s.length === 0) {
      s.push("✅ Sab healthy dikh raha hai — collection aur margin dono theek hain. 🎉");
    }
    return s;
  }, [report, cash, isProfit, cashIsProfit]);

  const handleExport = () => {
    if (!report) return;
    const rows = [
      { metric: "Total Sales (billed, delivered)", value: report.totalSales },
      { metric: "Collected (cash received)", value: cash.collected },
      { metric: "Outstanding (to collect)", value: cash.outstanding },
      { metric: "Total Expense", value: report.totalExpense },
      { metric: "COGS (goods sold)", value: report.cogs },
      { metric: "Operating Expense", value: report.operatingExpense },
      { metric: "Gross Profit", value: report.grossProfit },
      { metric: "Gross Margin %", value: report.grossMargin },
      { metric: isProfit ? "Net Profit (accrual)" : "Net Loss (accrual)", value: isProfit ? report.netProfit : report.netLoss },
      { metric: "Cash Profit (collected - expense)", value: cashProfit },
      { metric: "Net Margin %", value: report.netMargin },
      { metric: "Status", value: report.status },
      ...CATEGORIES.map((c) => ({ metric: c.label, value: report[c.key] })),
    ];
    downloadCsv(`profit-loss-${from || "all"}_to_${to || "now"}.csv`, rows, [
      { header: "Metric", value: (r) => r.metric },
      { header: "Value", value: (r) => r.value },
    ]);
  };

  return (
    <div className="animate-fade-up space-y-6 p-4 sm:p-6">
      {/* Header + date filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
          📊 Profit &amp; Loss
        </h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-ink-500">
            <span className="mb-1 block">📅 From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="text-xs font-semibold text-ink-500">
            <span className="mb-1 block">📅 To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <button
            onClick={() => load(from, to)}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[.98]"
          >
            ✨ Apply
          </button>
          {(from || to) && (
            <button
              onClick={() => { setFrom(""); setTo(""); load(); }}
              className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
            >
              All time
            </button>
          )}
          {report && (
            <button
              onClick={handleExport}
              className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
            >
              ⬇️ Export CSV
            </button>
          )}
        </div>
      </div>

      {loading || !report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Top summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard emoji="💰" label="Total Sales (billed)" value={inr(report.totalSales)} sub="Delivered orders" tone="green" delay={0} />
            <StatCard emoji="🧾" label="Total Expense" value={inr(report.totalExpense)} tone="red" delay={60} />
            <StatCard emoji="📈" label="Gross Profit" value={inr(report.grossProfit)} sub={`Margin ${report.grossMargin}%`} tone="blue" delay={120} />
            <StatCard
              emoji={isProfit ? "✅" : "🔻"}
              label={isProfit ? "Net Profit" : "Net Loss"}
              value={inr(isProfit ? report.netProfit : report.netLoss)}
              sub={`Net margin ${report.netMargin}%`}
              tone={isProfit ? "green" : "red"}
              delay={180}
            />
          </div>

          {/* Cash & collections */}
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              💵 Cash &amp; collections
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-500">{cash.count} delivered</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard emoji="🚚" label="Delivered (billed)" value={inr(cash.billed)} sub="Total invoiced" tone="blue" delay={0} />
              <StatCard emoji="✅" label="Collected (cash in)" value={inr(cash.collected)} sub={`${cash.collectionRate}% of billed`} tone="green" delay={60} />
              <StatCard emoji="🔴" label="Outstanding" value={inr(cash.outstanding)} sub="Still to collect" tone="red" delay={120} />
              <StatCard
                emoji={cashIsProfit ? "🟢" : "🔴"}
                label="Cash profit"
                value={inr(cashProfit)}
                sub="Collected − expense"
                tone={cashIsProfit ? "green" : "red"}
                delay={180}
              />
            </div>

            {/* Per-day breakdown */}
            {cash.days.length > 0 && (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                      <th className="px-4 py-2 font-semibold">📅 Day</th>
                      <th className="px-4 py-2 text-center font-semibold">📦 Orders</th>
                      <th className="px-4 py-2 text-right font-semibold">🚚 Billed</th>
                      <th className="px-4 py-2 text-right font-semibold">✅ Collected</th>
                      <th className="px-4 py-2 text-right font-semibold">🔴 Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {cash.days.map((d, i) => (
                      <tr key={d.date} style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }} className="animate-fade-up hover:bg-ink-50/50">
                        <td className="px-4 py-2 font-medium text-ink-800">{fmtDay(d.date)}</td>
                        <td className="px-4 py-2 text-center text-ink-600">{d.orders}</td>
                        <td className="px-4 py-2 text-right font-semibold text-ink-800">{inr(d.billed)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-emerald-600">{inr(d.collected)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-red-600">{inr(d.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* COGS vs Operating */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard emoji="🏭" label="COGS (goods sold)" value={inr(report.cogs)} sub="Raw + Manufacturing + Packaging" delay={0} />
            <StatCard emoji="🏢" label="Operating Expense" value={inr(report.operatingExpense)} sub="Salary + Rent + Electricity + Delivery + Other" delay={60} />
            <StatCard emoji={isProfit ? "🟢" : "🔴"} label="Status" value={report.status} tone={isProfit ? "green" : "red"} delay={120} />
          </div>

          {/* Suggestions */}
          <div className="animate-fade-up rounded-3xl border border-brand-100 bg-brand-50/40 p-5 shadow-sm sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900">💡 Suggestions</h3>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="flex animate-fade-up items-start gap-2 rounded-xl bg-white p-3 text-sm text-ink-700 shadow-sm"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Expense breakdown */}
          <div className="animate-fade-up rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">🧮 Expense breakdown</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((c, i) => (
                <div
                  key={c.key}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`animate-fade-up rounded-2xl p-4 transition-transform hover:-translate-y-0.5 ${c.tint}`}
                >
                  <p className="text-xs font-semibold opacity-80">{c.emoji} {c.label}</p>
                  <p className="mt-1 text-lg font-bold">{inr(report[c.key])}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pie + final analysis */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="animate-fade-up rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-lg font-bold text-ink-900">🥧 Expense distribution</h3>
              {pieData.length === 0 ? (
                <p className="grid h-72 place-items-center text-sm text-ink-400">No expenses recorded yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => inr(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="animate-fade-up rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-lg font-bold text-ink-900">🎯 Final analysis</h3>
              <div className={`rounded-2xl p-8 text-center ${isProfit ? "bg-brand-50" : "bg-red-50"}`}>
                <p className="text-sm font-semibold text-ink-500">Current status</p>
                <p className={`mt-2 text-4xl font-bold ${isProfit ? "text-brand-700" : "text-red-600"}`}>
                  {isProfit ? "PROFIT 🎉" : "LOSS ⚠️"}
                </p>
                <div className="mt-6">
                  <p className="text-sm text-ink-500">{isProfit ? "Net Profit" : "Net Loss"} (on paper)</p>
                  <p className={`text-3xl font-bold ${isProfit ? "text-brand-700" : "text-red-600"}`}>
                    {inr(isProfit ? report.netProfit : report.netLoss)}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    on sales of {inr(report.totalSales)} · net margin {report.netMargin}%
                  </p>
                  <div className="mx-auto mt-4 max-w-xs rounded-xl bg-white/70 p-3">
                    <p className="text-xs text-ink-500">💵 Cash profit (collected − expense)</p>
                    <p className={`text-2xl font-bold ${cashIsProfit ? "text-brand-700" : "text-red-600"}`}>{inr(cashProfit)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
