import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  importProducts
} from '../../services/products.js';


export default function Product() {

  const { data, loading, refresh } =
  useAsyncData(() => fetchProducts());
const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState('');
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: '',
  quantity: '',
  manufacturingDate: '',
  image: null,
  variants: []
});

 const handleEdit = (product) => {
 setFormData({
  ...product,
  variants: product.variants || []
}); // modal me data fill

  setTouched({});
  setSubmitted(false);
  setEditId(product.id);
  setShowModal(true);
};



// Which fields the user has interacted with (so we only show an error once they've left it),
// and whether a save was attempted (which reveals every remaining error at once).
const [touched, setTouched] = useState({});
const [submitted, setSubmitted] = useState(false);

const markTouched = (key) => setTouched((prev) => ({ ...prev, [key]: true }));
// Show a field's error only after it's been touched or a save was attempted — so the form doesn't
// scream red the moment it opens, but a skipped column lights up as soon as you move past it.
const isVisible = (key) => submitted || touched[key];

// Per-field validation. Returns { name, image, novariants, variants: [{size,stock,price}] }.
// Computed every render so errors update live as the user types — no round-trip to the backend.
// Price/stock live ONLY on the variants; the product's own price & total quantity are derived from
// them at save time (see handleSave), so the admin never enters those numbers twice.
const computeErrors = () => {
  const e = { variants: [] };

  if (!(formData.name || '').trim()) e.name = 'Product name is required.';

  // Image is mandatory when creating; on edit the existing image is kept if none is chosen.
  if (!editId && !formData.image) e.image = 'Please choose a product image.';

  // At least one variant is required — the product's price & quantity come from the variants.
  if (!(formData.variants || []).length)
    e.novariants = 'Add at least one variant (size, stock, price).';

  const seenSizes = new Set();
  (formData.variants || []).forEach((v, i) => {
    const ve = {};
    const size = (v.size || '').trim();
    if (!size) {
      ve.size = 'Size is required.';
    } else {
      // MySQL's unique index on (product_id, size) is case-insensitive, so "200ml" and "200ML"
      // collide — compare case-insensitively to catch it before the DB rejects it.
      const key = size.toLowerCase();
      if (seenSizes.has(key)) ve.size = `"${size}" is used twice.`;
      seenSizes.add(key);
    }
    if (v.stock === '' || v.stock == null || Number.isNaN(Number(v.stock)) || Number(v.stock) < 0)
      ve.stock = 'Stock must be 0 or more.';
    if (v.price === '' || v.price == null || Number.isNaN(Number(v.price)) || Number(v.price) < 0)
      ve.price = 'Price must be 0 or more.';
    e.variants[i] = ve;
  });
  return e;
};

const errors = computeErrors();
const hasErrors = Boolean(
  errors.name || errors.image || errors.novariants
    || errors.variants.some((ve) => ve && Object.keys(ve).length > 0),
);

// Border colour helper: red once a field's error is visible, brand-blue otherwise.
const fieldBorder = (showRed) => (showRed
  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
  : 'border-ink-200 focus:border-brand-500 focus:ring-brand-100');

const handleSave = async () => {
  // First save attempt: reveal every outstanding error inline (no need to touch each field).
  setSubmitted(true);
  if (hasErrors) {
    toast.error('Please fix the highlighted fields.');
    return;
  }

  const savingToast = toast.loading(editId ? 'Updating product…' : 'Adding product…');
  try {
    const form = new FormData();

    // Coerce each variant's numbers so the payload never carries "" / strings for stock/price.
    const variants = (formData.variants || []).map((v) => ({
      size: (v.size || '').trim(),
      stock: Number(v.stock),
      price: Number(v.price),
    }));

    // The backend still requires a product-level price & quantity, but the admin only enters them
    // per variant now. Derive them: price = the lowest variant price ("starting from"), quantity =
    // the total stock across all variants. One source of truth — no double entry.
    const derivedPrice = Math.min(...variants.map((v) => v.price));
    const derivedQuantity = variants.reduce((sum, v) => sum + v.stock, 0);

    form.append(
      "data",
      new Blob(
        [JSON.stringify({
          name: formData.name.trim(),
          description: formData.description,
          price: derivedPrice,
          quantity: derivedQuantity,
          // Empty date string would fail LocalDate parsing on the server — send null instead.
          manufacturingDate: formData.manufacturingDate || null,
          variants,
        })],
        { type: "application/json" }
      )
    );

    if (formData.image) {
      form.append("image", formData.image);
    }

    if (editId) {
      await updateProduct(editId, form);
    } else {
      await createProduct(form);
    }

    toast.success(editId ? 'Product updated' : 'Product added', { id: savingToast });
    refresh();
    setShowModal(false);
    setEditId(null);

  } catch (error) {
    // Surface the backend's real reason (field errors first, then the message) instead of swallowing it.
    const data = error?.response?.data;
    const message = data?.fieldErrors?.length
      ? data.fieldErrors.map((f) => f.message || f.field).join(', ')
      : data?.message || 'Could not save product. Please try again.';
    toast.error(message, { id: savingToast });
    console.error(error);
  }
};

const handleDelete = async (id) => {
  try {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    await deleteProduct(id);
    refresh();
  } catch (error) {
    console.error(error);
  }
};

const fileInputRef = useRef(null);
const [importing, setImporting] = useState(false);

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleImportFile = async (event) => {
  const file = event.target.files?.[0];
  // Reset so selecting the same file again re-triggers onChange.
  event.target.value = '';
  if (!file) return;

  setImporting(true);
  const loadingId = toast.loading('Importing products…');
  try {
    const result = await importProducts(file);
    const { total = 0, imported = 0, skipped = 0, errors = [] } = result || {};

    toast.success(`Imported ${imported} of ${total} (${skipped} skipped)`, { id: loadingId });

    if (errors.length) {
      toast.error(
        (t) => (
          <div className="max-w-xs">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="font-semibold">{errors.length} row(s) skipped</span>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="text-xs text-ink-400 hover:text-ink-700"
              >✕</button>
            </div>
            <ul className="list-disc space-y-0.5 pl-4 text-xs">
              {errors.slice(0, 8).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {errors.length > 8 && <li>…and {errors.length - 8} more</li>}
            </ul>
          </div>
        ),
        { duration: 8000 }
      );
    }

    refresh();
  } catch (error) {
    console.error(error);
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Import failed. Please check the file and try again.';
    toast.error(msg, { id: loadingId });
  } finally {
    setImporting(false);
  }
};

const handleDownloadSample = () => {
  const csv = 'name,description,price,quantity,category\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products-sample.csv';
  link.click();
  URL.revokeObjectURL(url);
};
  // Products are rendered as modern cards below (see the grid in the return), so no table columns.

  const filteredRows = useMemo(() => {
    const base = data ?? [];

    if (!search) return base;

    return base.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);
return (
  <>
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
        📦 Products
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {(data ?? []).length}
        </span>
      </h2>
    </div>

    <div className="flex items-center justify-between gap-4 mb-2">
  <SearchInput
    value={search}
    onChange={(val) => setSearch(val)}
    placeholder="Search products..."
  />

  <div className="flex items-center gap-2">
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      className="hidden"
      onChange={handleImportFile}
    />

    <Button onClick={handleImportClick} disabled={importing}>
      {importing ? '⏳ Importing…' : '⬆️ Import CSV'}
    </Button>

    <Button
    onClick={() => {
      setEditId(null);
  setFormData({
    name: '',
    description: '',
    price: '',
    quantity: '',
    manufacturingDate: '',
   image: null,
    variants: []
  });
  setTouched({});
  setSubmitted(false);

      setShowModal(true);
    }}
  >
    ➕ Add Product
  </Button>
  </div>
</div>

<div className="mb-2 flex justify-end">
  <button
    type="button"
    onClick={handleDownloadSample}
    className="text-xs font-semibold text-brand-600 underline-offset-2 hover:underline"
  >
    ⬇️ Download sample CSV
  </button>
</div>

    {loading ? (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl bg-ink-100" />
        ))}
      </div>
    ) : filteredRows.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
        <div className="text-4xl">📦</div>
        <p className="mt-2 text-sm font-semibold text-ink-600">No products found</p>
        <p className="text-xs text-ink-400">Add a product or adjust your search.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRows.map((p, i) => (
          <div
            key={p.id}
            style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
            className="group flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            {/* Image — blurred backdrop fills the frame (full-bleed look) while the real
                product sits on top with object-contain, so nothing is ever cropped. */}
            <div className="relative flex h-32 items-center justify-center overflow-hidden bg-ink-100">
              <img
                src={`http://localhost:8080${p.imageUrl}`}
                aria-hidden
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              />
              <img
                src={`http://localhost:8080${p.imageUrl}`}
                alt={p.name}
                className="relative max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              />
              <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-ink-600 shadow-sm">
                🎚️ {p.variants?.length || 0} variant{(p.variants?.length || 0) === 1 ? "" : "s"}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-3">
              <h3 className="truncate text-sm font-bold text-ink-900">{p.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-500">{p.description || "—"}</p>

              {/* Variant chips */}
              <div className="mt-2 flex flex-wrap gap-1">
                {p.variants?.length ? (
                  p.variants.map((v) => (
                    <span
                      key={v.id ?? v.size}
                      className="inline-flex items-center gap-1 rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-700 ring-1 ring-inset ring-ink-100"
                    >
                      <b className="text-ink-900">{v.size}</b>
                      <span className="text-ink-300">·</span>
                      📦 {v.stock}
                      <span className="text-ink-300">·</span>
                      <span className="font-bold text-brand-700">₹{v.price}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-ink-400">No variants</span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-1.5 border-t border-ink-50 pt-2.5">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 rounded-lg bg-brand-600 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-[.97]"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

   {showModal && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">📦</span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-ink-900">
            {editId ? 'Edit product' : 'Add product'}
          </h3>
          <p className="truncate text-xs text-ink-500">
            {editId ? 'Update details & variants' : 'Create a product with its variants'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowModal(false); setEditId(null); setTouched({}); setSubmitted(false); }}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          aria-label="Close"
        >✕</button>
      </div>

      {/* Body (scrolls) */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏷️ Product name</span>
          <input
            className={`w-full rounded-xl border px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:ring-2 ${fieldBorder(isVisible('name') && errors.name)}`}
            placeholder="e.g. Paracetamol 500mg"
            value={formData.name}
            onBlur={() => markTouched('name')}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {isVisible('name') && errors.name && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">📝 Description</span>
          <textarea
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="Short description of the product…"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">📅 Manufacturing date</span>
          <input
            type="date"
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={formData.manufacturingDate}
            onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">🖼️ Product image</span>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-ink-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            onChange={(e) => {
              markTouched('image');
              setFormData({ ...formData, image: e.target.files[0] });
            }}
          />
          {formData.image?.name && (
            <p className="mt-1 text-xs text-ink-400">Selected: {formData.image.name}</p>
          )}
          {isVisible('image') && errors.image && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.image}</p>
          )}
        </div>

        {/* Variants */}
        <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-800">🎚️ Variants</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink-500 shadow-sm">
              {formData.variants.length} added
            </span>
          </div>

          {formData.variants.length === 0 && (
            <p className="rounded-xl border border-dashed border-ink-200 bg-white/60 p-4 text-center text-xs text-ink-400">
              No variants yet — add sizes like <b>100ml</b> / <b>250ml</b> with their stock &amp; price.
            </p>
          )}

          {submitted && errors.novariants && (
            <p className="mt-2 text-xs font-medium text-red-500">{errors.novariants}</p>
          )}

          <div className="space-y-2">
            {formData.variants.map((variant, index) => (
              <div key={index} className="rounded-xl border border-ink-100 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-500">Variant {index + 1}</span>
                  <button
                    type="button"
                    title="Remove variant"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        variants: formData.variants.filter((_, i) => i !== index),
                      })
                    }
                    className="rounded-lg px-1.5 text-base text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >🗑️</button>
                </div>

                <div className="grid grid-cols-3 items-start gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-ink-500">📐 Size</span>
                    <input
                      className={`w-full rounded-lg border px-2 py-2 text-sm outline-none focus:ring-2 ${fieldBorder(isVisible(`v${index}.size`) && errors.variants[index]?.size)}`}
                      placeholder="500ml"
                      value={variant.size}
                      onBlur={() => markTouched(`v${index}.size`)}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[index] = { ...updated[index], size: e.target.value };
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                    {isVisible(`v${index}.size`) && errors.variants[index]?.size && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">{errors.variants[index].size}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-ink-500">📊 Stock</span>
                    <input
                      type="number"
                      className={`w-full rounded-lg border px-2 py-2 text-sm outline-none focus:ring-2 ${fieldBorder(isVisible(`v${index}.stock`) && errors.variants[index]?.stock)}`}
                      placeholder="0"
                      value={variant.stock}
                      onBlur={() => markTouched(`v${index}.stock`)}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[index] = { ...updated[index], stock: e.target.value };
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                    {isVisible(`v${index}.stock`) && errors.variants[index]?.stock && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">{errors.variants[index].stock}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-ink-500">💰 Price</span>
                    <input
                      type="number"
                      className={`w-full rounded-lg border px-2 py-2 text-sm outline-none focus:ring-2 ${fieldBorder(isVisible(`v${index}.price`) && errors.variants[index]?.price)}`}
                      placeholder="₹0"
                      value={variant.price}
                      onBlur={() => markTouched(`v${index}.price`)}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[index] = { ...updated[index], price: e.target.value };
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                    {isVisible(`v${index}.price`) && errors.variants[index]?.price && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">{errors.variants[index].price}</p>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                variants: [...formData.variants, { size: '', stock: '', price: '' }],
              })
            }
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >➕ Add variant</button>
        </div>
      </div>

      {/* Footer (sticky) */}
      <div className="flex gap-3 border-t border-ink-100 px-5 py-4 pb-safe">
        <button
          type="button"
          onClick={() => {
            setShowModal(false);
            setEditId(null);
            setTouched({});
            setSubmitted(false);
            setFormData({
              name: '', description: '', price: '', quantity: '',
              manufacturingDate: '', imageUrl: '', variants: [],
            });
          }}
          className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
        >✖ Cancel</button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
        >{editId ? '✅ Update product' : '✅ Save product'}</button>
      </div>
    </div>
  </div>
)}
  </>
);
}