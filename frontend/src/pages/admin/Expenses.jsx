import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../services/expenses";
import { required, runValidators } from "../../utils/validators.js";
import { downloadCsv, todayStamp } from "../../utils/exportCsv.js";

// validators.js has no numeric rule, so keep a small local one.
const positiveNumber = (label) => (value) =>
  value === "" || value == null || isNaN(Number(value)) || Number(value) <= 0
    ? `${label} must be a number greater than 0`
    : null;

function validate(values) {
  return {
    expenseName: runValidators(values.expenseName, required("Expense name")),
    expenseType: runValidators(values.expenseType, required("Expense type")),
    amount: runValidators(values.amount, positiveNumber("Amount")),
    expenseDate: runValidators(values.expenseDate, required("Expense date")),
    description: runValidators(values.description, required("Description")),
  };
}

const inputClass =
  "w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function Expenses() {

  const emptyForm = {
    expenseName: "",
    expenseType: "",
    amount: "",
    description: "",
    expenseDate: "",
    referenceId: "",
    referenceType: "",
  };

  const expenseTypes = [
    "RAW_MATERIAL",
    "MANUFACTURING",
    "PACKAGING",
    "DELIVERY",
    "SALARY",
    "ELECTRICITY",
    "RENT",
    "OTHER",
  ];

  const referenceTypes = [
    "RAW_MATERIAL",
    "ORDER",
  ];

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load expenses");
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
      expenseName: item.expenseName,
      expenseType: item.expenseType,
      amount: item.amount,
      description: item.description ?? "",
      expenseDate: item.expenseDate,
      referenceId: item.referenceId ?? "",
      referenceType: item.referenceType ?? "",
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

      const payload = {
        ...form,
        amount: Number(form.amount),
        referenceId: form.referenceId
          ? Number(form.referenceId)
          : null,
      };

      if (editingId) {
        await updateExpense(editingId, payload);
        toast.success("Expense Updated Successfully");
      } else {
        await createExpense(payload);
        toast.success("Expense Added Successfully");
      }

      closeModal();
      loadExpenses();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Something went wrong."
      );

    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
          🧾 Expenses
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
            {expenses.length}
          </span>
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              downloadCsv(`expenses-${todayStamp()}.csv`, expenses, [
                { header: "Date", value: (e) => e.expenseDate },
                { header: "Name", value: (e) => e.expenseName },
                { header: "Type", value: (e) => e.expenseType },
                { header: "Amount", value: (e) => e.amount },
                { header: "Reference type", value: (e) => e.referenceType ?? "" },
                { header: "Reference id", value: (e) => e.referenceId ?? "" },
                { header: "Description", value: (e) => e.description ?? "" },
              ])
            }
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-bold text-ink-600 shadow-sm transition-colors hover:bg-ink-50 active:scale-[.99]"
          >
            ⬇️ Export CSV
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
          >
            ➕ Add Expense
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/70 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">🧾 Name</th>
                <th className="px-4 py-3">🗂️ Type</th>
                <th className="px-4 py-3">💰 Amount</th>
                <th className="px-4 py-3">📅 Date</th>
                <th className="px-4 py-3">🔗 Ref Id</th>
                <th className="px-4 py-3">🔖 Ref Type</th>
                <th className="px-4 py-3">📝 Description</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-ink-400"
                  >
                    No Expenses Found
                  </td>
                </tr>
              ) : (
                expenses.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-ink-50 text-ink-800 transition-colors hover:bg-ink-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-ink-900">{item.expenseName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {item.expenseType?.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹ {item.amount}</td>
                    <td className="px-4 py-3">{item.expenseDate}</td>
                    <td className="px-4 py-3">{item.referenceId ?? "-"}</td>
                    <td className="px-4 py-3">
                      {item.referenceType?.replaceAll("_", " ") ?? "-"}
                    </td>
                    <td className="px-4 py-3 max-w-[16rem] truncate text-ink-500">
                      {item.description || "-"}
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
                            if (!window.confirm("Delete this expense?")) {
                              return;
                            }
                            try {
                              await deleteExpense(item.id);
                              toast.success("Expense Deleted Successfully");
                              loadExpenses();
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
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">🧾</span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  {editingId ? "Edit expense" : "Add expense"}
                </h3>
                <p className="truncate text-xs text-ink-500">
                  {editingId ? "Update expense details" : "Record a new expense"}
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
              id="expenseForm"
              onSubmit={handleSubmit}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🧾 Expense name</span>
                  <input
                    type="text"
                    name="expenseName"
                    placeholder="e.g. Diesel refill"
                    value={form.expenseName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.expenseName && <p className="mt-1 text-xs text-red-600">{errors.expenseName}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🗂️ Expense type</span>
                  <select
                    name="expenseType"
                    value={form.expenseType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Expense Type</option>
                    {expenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  {errors.expenseType && <p className="mt-1 text-xs text-red-600">{errors.expenseType}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">💰 Amount</span>
                  <input
                    type="number"
                    name="amount"
                    placeholder="₹0"
                    value={form.amount}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">📅 Expense date</span>
                  <input
                    type="date"
                    name="expenseDate"
                    value={form.expenseDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.expenseDate && <p className="mt-1 text-xs text-red-600">{errors.expenseDate}</p>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🔗 Reference id <span className="font-normal text-ink-400">(optional)</span></span>
                  <input
                    type="number"
                    name="referenceId"
                    placeholder="e.g. 12"
                    value={form.referenceId}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🔖 Reference type <span className="font-normal text-ink-400">(optional)</span></span>
                  <select
                    name="referenceType"
                    value={form.referenceType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Reference Type</option>
                    {referenceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">📝 Description</span>
                <textarea
                  name="description"
                  placeholder="Notes about this expense…"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </label>
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
                form="expenseForm"
                className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
              >{editingId ? "✅ Update expense" : "✅ Save expense"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
