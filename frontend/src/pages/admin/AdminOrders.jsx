import { useEffect, useState } from "react";
import {
  fetchAllOrders,
  updateOrderStatus,
} from "../../services/adminOrders";
import { updateOrderAmount } from "../../services/adminOrders";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [search, setSearch] = useState("");
const [filteredOrders, setFilteredOrders] = useState([]);

  const loadOrders = async () => {
  const data = await fetchAllOrders();

  console.log("Orders =", data);

  setOrders(data);
};

  const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
};

  useEffect(() => {
  loadOrders();
}, []);

useEffect(() => {
  setFilteredOrders(orders);
}, [orders]);

const groupedOrders = filteredOrders.reduce((acc, order) => {
  const date = order.orderDate.split("T")[0];

  if (!acc[date]) {
    acc[date] = {};
  }

  const groupId = order.orderGroupId;

  if (!acc[date][groupId]) {
    acc[date][groupId] = [];
  }

  acc[date][groupId].push(order);

  return acc;
}, {});

  const handleStatusChange = async (id, status) => {
  try {
    await updateOrderStatus(id, status);
    loadOrders();
  } catch (err) {
    console.log(err.response?.data);

    alert(
      err.response?.data?.message ||
      "Failed to update order status."
    );
  }
};

  const handleAmountChange = async (id, amount) => {
  try {
    await updateOrderAmount(id, amount);
    loadOrders();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to update amount."
    );
  }
};

const handleConfirm = async (groupOrders) => {
  try {

    // Check if every product has amount
    const hasEmptyAmount = groupOrders.some((order) => {
  const amount = Number(order.productAmount);

  return (
    order.productAmount === null ||
    order.productAmount === undefined ||
    String(order.productAmount).trim() === "" ||
    isNaN(amount) ||
    amount <= 0
  );
});



    if (hasEmptyAmount) {
      alert("Please enter amount for all medicines before confirming.");
      return;
    }

    await updateOrderStatus(groupOrders[0].id, "CONFIRMED");

loadOrders();

  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to confirm order."
    );
  }
};

const handleDeliver = async (groupOrders) => {
  try {
    await updateOrderStatus(
      groupOrders[0].id,
      "DELIVERED"
    );

    await loadOrders();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to deliver order."
    );
  }
};

const handleApply = () => {
  let result = [...orders];

  if (fromDate) {
    result = result.filter(
      (o) => new Date(o.orderDate) >= new Date(fromDate)
    );
  }

  if (toDate) {
    result = result.filter(
      (o) => new Date(o.orderDate) <= new Date(toDate + "T23:59:59")
    );
  }

  if (search) {
    result = result.filter(
      (o) =>
        o.userName?.toLowerCase().includes(search.toLowerCase()) ||
        o.productName?.toLowerCase().includes(search.toLowerCase())
    );
  }

  setFilteredOrders(result);
};
return (
  <div>

    {/* Filters */}
    <div className="bg-white shadow-md rounded-xl p-5 mb-6">
      <div className="flex flex-wrap gap-4 items-end">

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search user or medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow"
        >
          Apply
        </button>

      </div>
    </div>

    {/* Orders Grouped By Date */}
    <div className="space-y-6">

      {Object.entries(groupedOrders)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([date, groupMap]) => (
          
          <div key={date} className="bg-white rounded-xl shadow-md overflow-hidden">

            {/* Date Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3">
              <h2 className="font-semibold text-lg">
                📅 {formatDate(date)}
              </h2>
            </div>

            {/* Groups */}
           {Object.entries(groupMap).map(([groupId, groupOrders]) => {

  const totalAmount = groupOrders.reduce(
  (sum, item) => sum + (Number(item.productAmount) || 0),
  0
);

  return (
              <div key={groupId}>

                {/* Group Header */}
                <div className="bg-gray-100 px-5 py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">
                      👤 {groupOrders[0].userName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      📍 {groupOrders[0].deliveryAddress}
                    </p>
                    <p className="mt-2 text-base font-bold text-blue-700">
      📦 Order Number : {groupOrders[0].orderNumber}
    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
  <tr>
    <th>Medicine</th>
    <th>Price</th>
    <th>Quantity</th>
    <th>Product Total</th>
    <th>Status</th>
  </tr>
</thead>

<tbody>
  {groupOrders.map((o) => (
    <tr key={o.id}>

      <td>{o.productName}</td>

      <td>
        <input
          type="number"
          value={o.productPrice ?? ""}
          disabled={
            o.status === "CONFIRMED" ||
            o.status === "DELIVERED"
          }
          onChange={(e) =>
            setOrders((prev) =>
              prev.map((item) =>
                item.id === o.id
                  ? {
                      ...item,
                      productPrice: e.target.value,
                    }
                  : item
              )
            )
          }
          onBlur={(e) =>
            handleAmountChange(o.id, Number(e.target.value))
          }
          className="border rounded px-2 py-1 w-24"
        />
      </td>

      <td>{o.quantity}</td>

      <td>₹ {o.productAmount}</td>

      <td>{o.status}</td>

    </tr>
  ))}
</tbody>
                  </table>

                  <div className="flex justify-between items-center px-5 py-4 border-t bg-gray-50">

  <div>
    
  <p className="font-bold text-lg text-blue-700">
    Total Amount : ₹ {groupOrders[0].totalAmount}
  </p>

  <p className="text-sm text-gray-600">
    Status : {groupOrders[0].status}
  </p>

  </div>

  {groupOrders[0].status === "PENDING" && (
  <button
    onClick={() => handleConfirm(groupOrders)}
    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
  >
    Confirm Order
  </button>
)}

{groupOrders[0].status === "CONFIRMED" && (
  <button
    onClick={() => handleDeliver(groupOrders)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
  >
    Deliver Order
  </button>
)}

{groupOrders[0].status === "DELIVERED" && (
  <span className="text-green-700 font-bold">
    ✔ Delivered
  </span>
)}
</div>

                </div>

              </div>

            
              );
})}

          </div>

        ))}
        
    </div>

  </div>
);
}