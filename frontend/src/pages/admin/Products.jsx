import { useMemo, useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant
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


  setEditId(product.id);
  setShowModal(true);
};



console.log("FORM DATA", formData);
const handleSave = async () => {
  try {
    const form = new FormData();

    form.append(
      "data",
      new Blob(
        [JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          manufacturingDate: formData.manufacturingDate,
          variants: formData.variants
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

    refresh();
    setShowModal(false);
    setEditId(null);

  } catch (error) {
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
  const columns = [
    {
      key: 'name',
      header: 'Product Name',
    },
    {
  key: 'description',
  header: 'Description',
  render: (row) =>
    row.description?.length > 50
      ? row.description.slice(0, 50) + '...'
      : row.description,
},
  
    {
  key: 'image',
  header: 'Image',
  render: (row) => (
    <img
      src={`http://localhost:8080${row.imageUrl}`}
      alt={row.name}
      style={{ width: 50, height: 50, objectFit: 'cover' }}
    />
  ),
},

{
  key: 'variants',
  header: 'Variants',
  render: (row) =>
    row.variants?.length
      ? row.variants.map(
          (v) => `${v.size} | Stock: ${v.stock} | ₹${v.price}`
        ).join(' , ')
      : 'No Variants'
},
    {
  key: 'actions',
  header: 'Actions',
  render: (row) => (
    <div className="flex gap-2">
      <Button onClick={() => handleEdit(row)}>
        Edit
      </Button>

      <Button
        
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </Button>
    </div>
  ),
},
  ];

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
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search products..."
  />

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

    setShowModal(true);
  }}
>
  ➕ Add Product
</Button>
</div>

    <Table
      columns={columns}
      rows={filteredRows}
      loading={loading}
      pageSize={8}
    />

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
          onClick={() => { setShowModal(false); setEditId(null); }}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          aria-label="Close"
        >✕</button>
      </div>

      {/* Body (scrolls) */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏷️ Product name</span>
          <input
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="e.g. Paracetamol 500mg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
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
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          />
          {formData.image?.name && (
            <p className="mt-1 text-xs text-ink-400">Selected: {formData.image.name}</p>
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

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-ink-500">📐 Size</span>
                    <input
                      className="w-full rounded-lg border border-ink-200 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="500ml"
                      value={variant.size}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[index].size = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-ink-500">📊 Stock</span>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-ink-200 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="0"
                      value={variant.stock}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[index].stock = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-ink-500">💰 Price</span>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-ink-200 px-2 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="₹0"
                      value={variant.price}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[index].price = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                    />
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