import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getProfitLoss } from "../../services/profitLoss";
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

function StatCard({ emoji, label, value, sub, tone = "ink" }) {
  const tones = {
    ink: "text-ink-900",
    green: "text-brand-700",
    red: "text-red-600",
    blue: "text-blue-700",
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
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
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async (f, t) => {
    setLoading(true);
    try {
      const data = await getProfitLoss(f || undefined, t || undefined);
      setReport(data);
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

  const isProfit = report?.status === "PROFIT";

  const handleExport = () => {
    if (!report) return;
    const rows = [
      { metric: "Total Sales", value: report.totalSales },
      { metric: "Total Expense", value: report.totalExpense },
      { metric: "COGS (goods sold)", value: report.cogs },
      { metric: "Operating Expense", value: report.operatingExpense },
      { metric: "Gross Profit", value: report.grossProfit },
      { metric: "Gross Margin %", value: report.grossMargin },
      {
        metric: isProfit ? "Net Profit" : "Net Loss",
        value: isProfit ? report.netProfit : report.netLoss,
      },
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
    <div className="space-y-6">
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
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700"
          >
            Apply
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
        <div className="grid place-items-center rounded-3xl border border-ink-100 bg-white p-16 text-ink-400">
          Loading…
        </div>
      ) : (
        <>
          {/* Top summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard emoji="💰" label="Total Sales" value={inr(report.totalSales)} tone="green" />
            <StatCard emoji="🧾" label="Total Expense" value={inr(report.totalExpense)} tone="red" />
            <StatCard
              emoji="📈"
              label="Gross Profit"
              value={inr(report.grossProfit)}
              sub={`Margin ${report.grossMargin}%`}
              tone="blue"
            />
            <StatCard
              emoji={isProfit ? "✅" : "🔻"}
              label={isProfit ? "Net Profit" : "Net Loss"}
              value={inr(isProfit ? report.netProfit : report.netLoss)}
              sub={`Net margin ${report.netMargin}%`}
              tone={isProfit ? "green" : "red"}
            />
          </div>

          {/* COGS vs Operating */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard emoji="🏭" label="COGS (goods sold)" value={inr(report.cogs)} sub="Raw + Manufacturing + Packaging" />
            <StatCard emoji="🏢" label="Operating Expense" value={inr(report.operatingExpense)} sub="Salary + Rent + Electricity + Delivery + Other" />
            <StatCard
              emoji={isProfit ? "🟢" : "🔴"}
              label="Status"
              value={report.status}
              tone={isProfit ? "green" : "red"}
            />
          </div>

          {/* Expense breakdown */}
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">🧮 Expense breakdown</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((c) => (
                <div key={c.key} className={`rounded-2xl p-4 ${c.tint}`}>
                  <p className="text-xs font-semibold opacity-80">{c.emoji} {c.label}</p>
                  <p className="mt-1 text-lg font-bold">{inr(report[c.key])}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pie + final analysis */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
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

            <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-lg font-bold text-ink-900">🎯 Final analysis</h3>
              <div className={`rounded-2xl p-8 text-center ${isProfit ? "bg-brand-50" : "bg-red-50"}`}>
                <p className="text-sm font-semibold text-ink-500">Current status</p>
                <p className={`mt-2 text-4xl font-bold ${isProfit ? "text-brand-700" : "text-red-600"}`}>
                  {isProfit ? "PROFIT 🎉" : "LOSS ⚠️"}
                </p>
                <div className="mt-6">
                  <p className="text-sm text-ink-500">{isProfit ? "Net Profit" : "Net Loss"}</p>
                  <p className={`text-3xl font-bold ${isProfit ? "text-brand-700" : "text-red-600"}`}>
                    {inr(isProfit ? report.netProfit : report.netLoss)}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    on sales of {inr(report.totalSales)} · net margin {report.netMargin}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
