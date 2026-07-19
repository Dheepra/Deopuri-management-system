import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSales, recordSale, getStock } from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const EMPTY = { productName: '', quantity: '1', salePrice: '', saleDate: '' };

export default function Sales() {
  const [params] = useSearchParams();
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, st] = await Promise.all([getSales(), getStock().catch(() => [])]);
      setSales(s);
      setStock(st);
    } catch {
      toast.error('Could not load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Open the form pre-filled when arriving from the catalog "Record sale" button (?product=Name).
  useEffect(() => {
    const p = params.get('product');
    if (p) {
      setForm((f) => ({ ...f, productName: p }));
      setShow(true);
    }
  }, [params]);

  const totals = useMemo(() => {
    const revenue = sales.reduce((s, x) => s + (Number(x.totalAmount) || 0), 0);
    const profit = sales.reduce((s, x) => s + (Number(x.profit) || 0), 0);
    const items = sales.reduce((s, x) => s + x.quantity, 0);
    return { revenue, profit, items, count: sales.length };
  }, [sales]);

  const selectedStock = stock.find((s) => s.productName === form.productName);

  const submit = async () => {
    if (!form.productName.trim() || !form.quantity) {
      toast.error('Product and quantity are required');
      return;
    }
    setSaving(true);
    try {
      await recordSale({
        productName: form.productName.trim(),
        quantity: Number(form.quantity),
        salePrice: form.salePrice === '' ? null : Number(form.salePrice),
        saleDate: form.saleDate || null,
      });
      toast.success('Sale recorded');
      setForm(EMPTY);
      setShow(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not record sale');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">🧾 Sales</h1>
            <p className="text-sm text-ink-500">Record your sales here — they flow straight into Profit & Loss.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/medical/profit-loss" className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">📊 P&amp;L</Link>
            <button onClick={() => setShow(true)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">➕ Record sale</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi emoji="💰" label="Revenue" value={loading ? '—' : inr(totals.revenue)} tint="bg-brand-50 text-brand-700" />
          <Kpi emoji="📈" label="Profit" value={loading ? '—' : inr(totals.profit)} tint="bg-emerald-50 text-emerald-700" />
          <Kpi emoji="📦" label="Items sold" value={loading ? '—' : totals.items} tint="bg-sky-50 text-sky-700" />
          <Kpi emoji="🧾" label="Sales" value={loading ? '—' : totals.count} tint="bg-amber-50 text-amber-700" />
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
        ) : sales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
            <div className="text-4xl">🧾</div>
            <p className="mt-2 text-sm font-semibold text-ink-600">No sales yet</p>
            <p className="text-xs text-ink-400">Add your first sale with "Record sale".</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-2 font-semibold">💊 Product</th>
                    <th className="px-4 py-2 font-semibold">🔢 Qty</th>
                    <th className="px-4 py-2 font-semibold">💵 Sale ₹</th>
                    <th className="px-4 py-2 font-semibold">🧾 Total</th>
                    <th className="px-4 py-2 font-semibold">📈 Profit</th>
                    <th className="px-4 py-2 font-semibold">📅 Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {[...sales].sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0)).map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 font-medium text-ink-800">{s.productName}</td>
                      <td className="px-4 py-2.5 text-ink-700">{s.quantity}</td>
                      <td className="px-4 py-2.5 text-ink-700">{inr(s.salePrice)}</td>
                      <td className="px-4 py-2.5 font-semibold text-ink-900">{inr(s.totalAmount)}</td>
                      <td className={`px-4 py-2.5 font-semibold ${(s.profit ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{inr(s.profit)}</td>
                      <td className="px-4 py-2.5 text-ink-500">{s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {show && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShow(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">➕ Record sale</h2>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-ink-500">Product
                {stock.length > 0 ? (
                  <select className={inputCls} value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}>
                    <option value="">Select from stock…</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.productName}>{s.productName} ({s.quantity} left)</option>
                    ))}
                  </select>
                ) : (
                  <input className={inputCls} placeholder="Product name" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
                )}
              </label>
              {selectedStock && (
                <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
                  Cost {inr(selectedStock.costPrice)} · Retail {inr(selectedStock.retailPrice)} · {selectedStock.quantity} in stock
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-ink-500">Quantity
                  <input className={inputCls} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </label>
                <label className="block text-xs font-semibold text-ink-500">Sale price (₹/unit)
                  <input className={inputCls} type="number" placeholder={selectedStock?.retailPrice ?? 'auto'} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
                </label>
              </div>
              <label className="block text-xs font-semibold text-ink-500">Date (optional)
                <input className={inputCls} type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} />
              </label>
              <p className="text-[11px] text-ink-400">Leave sale price empty to use the retail price.</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShow(false)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              <button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{saving ? 'Saving…' : 'Record'}</button>
            </div>
          </div>
        </div>
      )}
    </>
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
