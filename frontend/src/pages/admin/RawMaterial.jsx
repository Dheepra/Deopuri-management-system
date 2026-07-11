import { useEffect, useState } from "react";
import {
  getAllRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../../services/rawMaterial";

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

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await getAllRawMaterials();
      setMaterials(data);
    } catch (err) {
      console.log(err);
      alert("Failed to load raw materials");
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

      if (editingId) {
        await updateRawMaterial(editingId, form);
        alert("Raw Material Updated Successfully");
      } else {
        await createRawMaterial(form);
        alert("Raw Material Added Successfully");
      }

      setForm(emptyForm);
      setEditingId(null);

      loadMaterials();

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

Raw Material

</h2>

<form
onSubmit={handleSubmit}
className="grid grid-cols-2 gap-4"
>

<input
type="text"
name="name"
placeholder="Material Name"
value={form.name}
onChange={handleChange}
className="border rounded p-2"
/>

<input
type="text"
name="category"
placeholder="Category"
value={form.category}
onChange={handleChange}
className="border rounded p-2"
/>

<input
type="number"
name="quantity"
placeholder="Quantity"
value={form.quantity}
onChange={handleChange}
className="border rounded p-2"
/>

<input
type="text"
name="unit"
placeholder="Unit"
value={form.unit}
onChange={handleChange}
className="border rounded p-2"
/>

<input
type="number"
name="unitPrice"
placeholder="Unit Price"
value={form.unitPrice}
onChange={handleChange}
className="border rounded p-2"
/>

<input
type="text"
name="supplierName"
placeholder="Supplier Name"
value={form.supplierName}
onChange={handleChange}
className="border rounded p-2"
/>

<textarea
name="description"
placeholder="Description"
value={form.description}
onChange={handleChange}
className="border rounded p-2 col-span-2"
/>

<input
type="date"
name="purchaseDate"
value={form.purchaseDate}
onChange={handleChange}
className="border rounded p-2"
/>

<button
className="bg-blue-600 text-white rounded p-2"
>

{editingId ? "Update" : "Save"}

</button>

</form>

</div>

{/* Raw Material Table */}

<div className="bg-white rounded-xl shadow p-6">

  <h2 className="text-xl font-bold mb-4">
    Raw Material List
  </h2>

  <div className="overflow-x-auto">

    <table className="min-w-full border border-gray-200">

      <thead className="bg-blue-600 text-white">

        <tr>

          <th className="p-3">Name</th>

          <th className="p-3">Category</th>

          <th className="p-3">Quantity</th>

          <th className="p-3">Unit</th>

          <th className="p-3">Unit Price</th>

          <th className="p-3">Supplier</th>

          <th className="p-3">Purchase Date</th>

          <th className="p-3">Description</th>

          <th className="p-3">Action</th>

        </tr>

      </thead>

      <tbody>

        {materials.length === 0 ? (

          <tr>

            <td
              colSpan="9"
              className="text-center py-6 text-gray-500"
            >
              No Raw Material Found
            </td>

          </tr>

        ) : (

          materials.map((item) => (

            <tr
              key={item.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-3">{item.name}</td>

              <td className="p-3">{item.category}</td>

              <td className="p-3">{item.quantity}</td>

              <td className="p-3">{item.unit}</td>

              <td className="p-3">
                ₹ {item.unitPrice}
              </td>

              <td className="p-3">
                {item.supplierName}
              </td>

              <td className="p-3">
                {item.purchaseDate}
              </td>

              <td className="p-3">
                {item.description}
              </td>

              <td className="p-3 flex gap-2">

                <button
                  onClick={() => {

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

                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={async () => {

                    if (
                      !window.confirm(
                        "Delete this raw material?"
                      )
                    )
                      return;

                    try {

                      await deleteRawMaterial(item.id);

                      alert("Deleted Successfully");

                      loadMaterials();

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