import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getStock,
  addStock,
  updateStock,
  deleteStock,
} from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const LOW_STOCK = 10;
const EXPIRY_SOON_DAYS = 30;

const daysUntil = (d) => {
  if (!d) return null;
  const ms = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
};

const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const EMPTY = { productName: '', quantity: '', costPrice: '', retailPrice: '', expiryDate: '' };

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(null); // { id, retailPrice, expiryDate, quantity }

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getStock());
    } catch {
      toast.error('Could not load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const value = rows.reduce((s, r) => s + (Number(r.costPrice) || 0) * r.quantity, 0);
    const low = rows.filter((r) => r.quantity <= LOW_STOCK).length;
    const expiring = rows.filter((r) => {
      const d = daysUntil(r.expiryDate);
      return d != null && d <= EXPIRY_SOON_DAYS;
    }).length;
    return { value, low, expiring, count: rows.length };
  }, [rows]);

  const handleAdd = async () => {
    if (!form.productName.trim() || form.quantity === '') {
      toast.error('Product name and quantity are required');
      return;
    }
    setSaving(true);
    try {
      await addStock({
        productName: form.productName.trim(),
        quantity: Number(form.quantity),
        costPrice: form.costPrice === '' ? null : Number(form.costPrice),
        retailPrice: form.retailPrice === '' ? null : Number(form.retailPrice),
        expiryDate: form.expiryDate || null,
      });
      toast.success('Stock added');
      setForm(EMPTY);
      setShowAdd(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not add stock');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    try {
      await updateStock(edit.id, {
        quantity: edit.quantity === '' ? null : Number(edit.quantity),
        retailPrice: edit.retailPrice === '' ? null : Number(edit.retailPrice),
        expiryDate: edit.expiryDate || null,
      });
      toast.success('Updated');
      setEdit(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not update');
    }
  };

  const remove = async (id) => {
    try {
      await deleteStock(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Could not delete');
    }
  };

  return (
    <>
      <section className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">📦 My Inventory</h1>
            <p className="text-sm text-ink-500">Delivered orders from the company are auto-added here. Set your retail price.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/medical/orders" className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50">🔁 Reorder</Link>
            <button onClick={() => setShowAdd(true)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700">➕ Add stock</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi emoji="📦" label="Products" value={loading ? '—' : stats.count} tint="bg-sky-50 text-sky-700" />
          <Kpi emoji="💰" label="Stock value (cost)" value={loading ? '—' : inr(stats.value)} tint="bg-brand-50 text-brand-700" />
          <Kpi emoji="⚠️" label="Low stock" value={loading ? '—' : stats.low} sub={`≤ ${LOW_STOCK} left`} tint="bg-amber-50 text-amber-700" />
          <Kpi emoji="⏳" label="Expiring soon" value={loading ? '—' : stats.expiring} sub={`≤ ${EXPIRY_SOON_DAYS} days`} tint="bg-rose-50 text-rose-600" />
        </div>

        {/* Grid */}
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
            <div className="text-4xl">📭</div>
            <p className="mt-2 text-sm font-semibold text-ink-600">No stock yet</p>
            <p className="text-xs text-ink-400">Order from the company (it appears here once delivered) or add manually.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => {
              const d = daysUntil(r.expiryDate);
              const low = r.quantity <= LOW_STOCK;
              const expSoon = d != null && d <= EXPIRY_SOON_DAYS;
              return (
                <div key={r.id} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-bold text-ink-900">{r.productName}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${low ? (r.quantity === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700') : 'bg-emerald-50 text-emerald-700'}`}>
                      {r.quantity} left
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Cost" value={inr(r.costPrice)} />
                    <MiniStat label="Retail" value={inr(r.retailPrice)} tone="text-brand-700" />
                    <MiniStat label="Margin" value={r.marginPercent != null ? `${r.marginPercent}%` : '—'} tone={(r.marginPerUnit ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {r.expiryDate && (
                      <span className={`rounded-md px-2 py-0.5 font-semibold ${expSoon ? 'bg-rose-50 text-rose-600' : 'bg-ink-50 text-ink-500'}`}>
                        ⏳ {d < 0 ? 'Expired' : `${d}d`} · {new Date(r.expiryDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                    {r.sourceOrderNumber && (
                      <span className="rounded-md bg-ink-50 px-2 py-0.5 font-medium text-ink-400">📦 {r.sourceOrderNumber}</span>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-ink-50 pt-3">
                    <button onClick={() => setEdit({ id: r.id, retailPrice: r.retailPrice ?? '', expiryDate: r.expiryDate ?? '', quantity: r.quantity })} className="flex-1 rounded-lg bg-brand-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700">✏️ Edit</button>
                    <button onClick={() => remove(r.id)} className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">🗑️ Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">➕ Add stock</h2>
            <div className="space-y-3">
              <input className={inputCls} placeholder="Product name" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                <input className={inputCls} type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} type="number" placeholder="Cost price (₹/unit)" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                <input className={inputCls} type="number" placeholder="Retail price (₹/unit)" value={form.retailPrice} onChange={(e) => setForm({ ...form, retailPrice: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setEdit(null)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">✏️ Edit stock</h2>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-ink-500">Quantity
                <input className={inputCls} type="number" value={edit.quantity} onChange={(e) => setEdit({ ...edit, quantity: e.target.value })} />
              </label>
              <label className="block text-xs font-semibold text-ink-500">Retail price (₹/unit)
                <input className={inputCls} type="number" value={edit.retailPrice} onChange={(e) => setEdit({ ...edit, retailPrice: e.target.value })} />
              </label>
              <label className="block text-xs font-semibold text-ink-500">Expiry date
                <input className={inputCls} type="date" value={edit.expiryDate || ''} onChange={(e) => setEdit({ ...edit, expiryDate: e.target.value })} />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setEdit(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              <button onClick={saveEdit} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Kpi({ emoji, label, value, sub, tint }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <span className={`grid h-7 w-7 place-items-center rounded-lg text-sm ${tint}`}>{emoji}</span>
      </div>
      <p className="mt-2 font-display text-xl font-bold text-ink-900">{value}</p>
      {sub != null && <p className="mt-0.5 text-[11px] text-ink-400">{sub}</p>}
    </div>
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
