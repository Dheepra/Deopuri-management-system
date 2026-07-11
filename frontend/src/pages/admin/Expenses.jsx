import { useEffect, useState } from "react";
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../../services/expenses";

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

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (err) {
      console.log(err);
      alert("Failed to load expenses");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert("Expense Updated Successfully");
      } else {
        await createExpense(payload);
        alert("Expense Added Successfully");
      }

      setForm(emptyForm);
      setEditingId(null);

      loadExpenses();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Something went wrong."
      );

    }
  };

return (
  <div className="p-6">

    <div className="bg-white rounded-xl shadow p-6 mb-6">

      <h2 className="text-2xl font-bold mb-5">
        Expenses
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >

        {/* Expense Name */}
        <input
          type="text"
          name="expenseName"
          placeholder="Expense Name"
          value={form.expenseName}
          onChange={handleChange}
          className="border rounded-lg p-2"
          required
        />

        {/* Expense Type */}
        <select
          name="expenseType"
          value={form.expenseType}
          onChange={handleChange}
          className="border rounded-lg p-2"
          required
        >
          <option value="">Select Expense Type</option>

          {expenseTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        {/* Amount */}
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border rounded-lg p-2"
          required
        />

        {/* Expense Date */}
        <input
          type="date"
          name="expenseDate"
          value={form.expenseDate}
          onChange={handleChange}
          className="border rounded-lg p-2"
          required
        />

        {/* Reference Id */}
        <input
          type="number"
          name="referenceId"
          placeholder="Reference Id"
          value={form.referenceId}
          onChange={handleChange}
          className="border rounded-lg p-2"
        />

        {/* Reference Type */}
        <select
          name="referenceType"
          value={form.referenceType}
          onChange={handleChange}
          className="border rounded-lg p-2"
        >
          <option value="">Select Reference Type</option>

          {referenceTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="border rounded-lg p-2 md:col-span-2"
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {editingId ? "Update Expense" : "Add Expense"}
          </button>
        </div>

      </form>

    </div>

    {/* Table yahan aayegi */}

 
{/* Expenses Table */}

<div className="bg-white rounded-xl shadow p-6">

  <h2 className="text-xl font-bold mb-4">
    Expenses List
  </h2>

  <div className="overflow-x-auto">

    <table className="min-w-full border border-gray-200">

      <thead className="bg-blue-600 text-white">

        <tr>

          <th className="p-3">Expense Name</th>

          <th className="p-3">Expense Type</th>

          <th className="p-3">Amount</th>

          <th className="p-3">Expense Date</th>

          <th className="p-3">Reference Id</th>

          <th className="p-3">Reference Type</th>

          <th className="p-3">Description</th>

          <th className="p-3">Action</th>

        </tr>

      </thead>

      <tbody>

        {expenses.length === 0 ? (

          <tr>

            <td
              colSpan="8"
              className="text-center py-6 text-gray-500"
            >
              No Expenses Found
            </td>

          </tr>

        ) : (

          expenses.map((item) => (

            <tr
              key={item.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-3">{item.expenseName}</td>

              <td className="p-3">
                {item.expenseType?.replaceAll("_", " ")}
              </td>

              <td className="p-3">
                ₹ {item.amount}
              </td>

              <td className="p-3">
                {item.expenseDate}
              </td>

              <td className="p-3">
                {item.referenceId ?? "-"}
              </td>

              <td className="p-3">
                {item.referenceType ?? "-"}
              </td>

              <td className="p-3">
                {item.description || "-"}
              </td>

              <td className="p-3 flex gap-2">

                <button
                  onClick={() => {

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

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });

                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={async () => {

                    if (!window.confirm("Delete this expense?")) {
                      return;
                    }

                    try {

                      await deleteExpense(item.id);

                      alert("Expense Deleted Successfully");

                      loadExpenses();

                    } catch (err) {

                      alert(
                        err.response?.data?.message ||
                        "Delete Failed"
                      );

                    }

                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>
 
 </div>
);
}