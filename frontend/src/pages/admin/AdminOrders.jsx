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
    acc[date] = [];
  }

  acc[date].push(order);

  return acc;
}, {});

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    loadOrders(); // refresh
  };
  const handleAmountChange = async (id, amount) => {
  await updateOrderAmount(id, amount);
  loadOrders(); // refresh
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
  <div className="p-6 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">
      Admin Orders
    </h1>

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
        .map(([date, dateOrders]) => (
          <div
            key={date}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >

            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3">
              <h2 className="font-semibold text-lg">
                📅 {formatDate(date)}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Medicine</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {dateOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">{o.id}</td>

                      <td className="p-3">{o.userName}</td>

                      <td className="p-3">{o.productName}</td>

                      <td className="p-3 font-semibold text-green-600">
                        ₹{o.totalAmount}
                      </td>

                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(
                              o.id,
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-2 py-1"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                        </select>
                      </td>

                      <td className="p-3">
                        {formatDate(o.orderDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        ))}
    </div>

  </div>
);
}