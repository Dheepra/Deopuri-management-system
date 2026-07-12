import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../../services/rawMaterial";
import { required, runValidators } from "../../utils/validators.js";

// validators.js has no numeric rule, so keep a small local one.
const positiveNumber = (label) => (value) =>
  value === "" || value == null || isNaN(Number(value)) || Number(value) <= 0
    ? `${label} must be a number greater than 0`
    : null;

function validate(values) {
  return {
    name: runValidators(values.name, required("Material name")),
    category: runValidators(values.category, required("Category")),
    quantity: runValidators(values.quantity, positiveNumber("Quantity")),
    unit: runValidators(values.unit, required("Unit")),
    unitPrice: runValidators(values.unitPrice, positiveNumber("Unit price")),
    supplierName: runValidators(values.supplierName, required("Supplier name")),
    description: runValidators(values.description, required("Description")),
    purchaseDate: runValidators(values.purchaseDate, required("Purchase date")),
  };
}

const inputClass =
  "w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function RawMaterial() {

  const emptyForm = {
    name: "",
    category: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    supplierName: "",
    description: "",
    purchaseDate: "",
  };

  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await getAllRawMaterials();
      setMaterials(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load raw materials");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    // Clear this field's error on edit.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      supplierName: item.supplierName,
      description: item.description,
      purchaseDate: item.purchaseDate,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate(form);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {

      if (editingId) {
        await updateRawMaterial(editingId, form);
        toast.success("Raw Material Updated Successfully");
      } else {
        await createRawMaterial(form);
        toast.success("Raw Material Added Successfully");
      }

      closeModal();
      loadMaterials();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Something went wrong."
      );

    }
  };

  const lineCost =
    Number(form.quantity) > 0 && Number(form.unitPrice) > 0
      ? Number(form.quantity) * Number(form.unitPrice)
      : null;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
          🌿 Raw Material
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
            {materials.length}
          </span>
        </h2>

        <button
          type="button"
          onClick={openAdd}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
        >
          ➕ Add Material
        </button>
      </div>

      {/* Raw Material Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/70 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">🌿 Name</th>
                <th className="px-4 py-3">🏷️ Category</th>
                <th className="px-4 py-3">🔢 Qty</th>
                <th className="px-4 py-3">📏 Unit</th>
                <th className="px-4 py-3">💰 Unit Price</th>
                <th className="px-4 py-3">🏢 Supplier</th>
                <th className="px-4 py-3">📅 Purchase Date</th>
                <th className="px-4 py-3">📝 Description</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-ink-400"
                  >
                    No Raw Material Found
                  </td>
                </tr>
              ) : (
                materials.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-ink-50 text-ink-800 transition-colors hover:bg-ink-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-ink-900">{item.name}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">₹ {item.unitPrice}</td>
                    <td className="px-4 py-3">{item.supplierName}</td>
                    <td className="px-4 py-3">{item.purchaseDate}</td>
                    <td className="px-4 py-3 max-w-[16rem] truncate text-ink-500">
                      {item.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Delete this raw material?"))
                              return;
                            try {
                              await deleteRawMaterial(item.id);
                              toast.success("Deleted Successfully");
                              loadMaterials();
                            } catch (err) {
                              toast.error(
                                err.response?.data?.message || "Delete Failed"
                              );
                            }
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">🌿</span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  {editingId ? "Edit raw material" : "Add raw material"}
                </h3>
                <p className="truncate text-xs text-ink-500">
                  {editingId ? "Update material details" : "Record a new raw material purchase"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >✕</button>
            </div>

            {/* Body (scrolls) */}
            <form
              id="rawMaterialForm"
              onSubmit={handleSubmit}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🌿 Material name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Wheat Flour"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏷️ Category</span>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g. Grains"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🔢 Quantity</span>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    value={form.quantity}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">📏 Unit</span>
                  <input
                    type="text"
                    name="unit"
                    placeholder="e.g. kg / litre"
                    value={form.unit}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">💰 Unit price</span>
                  <input
                    type="number"
                    name="unitPrice"
                    placeholder="₹0"
                    value={form.unitPrice}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.unitPrice && <p className="mt-1 text-xs text-red-600">{errors.unitPrice}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏢 Supplier name</span>
                  <input
                    type="text"
                    name="supplierName"
                    placeholder="e.g. Sharma Traders"
                    value={form.supplierName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.supplierName && <p className="mt-1 text-xs text-red-600">{errors.supplierName}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">📅 Purchase date</span>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.purchaseDate && <p className="mt-1 text-xs text-red-600">{errors.purchaseDate}</p>}
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">📝 Description</span>
                <textarea
                  name="description"
                  placeholder="Notes about this material…"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </label>

              {lineCost !== null && (
                <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/60 px-3 py-2 text-sm text-brand-700">
                  🧮 Line cost = {form.quantity} × ₹{form.unitPrice} ={" "}
                  <b>₹{lineCost}</b>
                </div>
              )}
            </form>

            {/* Footer (sticky) */}
            <div className="flex gap-3 border-t border-ink-100 px-5 py-4 pb-safe">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
              >✖ Cancel</button>

              <button
                type="submit"
                form="rawMaterialForm"
                className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
              >{editingId ? "✅ Update material" : "✅ Save material"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
