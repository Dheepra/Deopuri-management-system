import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../../services/adminOrders";

export default function Payments() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const loadOrders = async () => {
    try {
      const data = await fetchAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN");
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
          o.orderNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredOrders(result);
  };

  // One row per Order Number
  const uniqueOrders = [];

  const map = new Map();

  filteredOrders.forEach((o) => {
    if (!map.has(o.orderNumber)) {
      map.set(o.orderNumber, o);
    }
  });

  map.forEach((value) => uniqueOrders.push(value));

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PARTIALLY_PAID":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };
  return (
  <div className="p-6">

    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Payment Management
      </h1>
      <p className="text-gray-500">
        View all order payments
      </p>
    </div>

    {/* Filters */}
    <div className="bg-white shadow rounded-xl p-5 mb-6">
      <div className="flex flex-wrap gap-4 items-end">

        <div>
          <label className="block text-sm font-medium mb-1">
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1">
            Search
          </label>

          <input
            type="text"
            placeholder="Search customer or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Apply
        </button>

      </div>
    </div>

    {/* Table */}

    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">

          <tr>

            <th className="p-3 text-left">Order No</th>

            <th className="p-3 text-left">Customer</th>

            <th className="p-3 text-center">Total</th>

            <th className="p-3 text-center">Paid</th>

            <th className="p-3 text-center">Remaining</th>

            <th className="p-3 text-center">Status</th>

            <th className="p-3 text-center">Date</th>

            <th className="p-3 text-center">Action</th>

          </tr>

        </thead>

        <tbody>

          {uniqueOrders.length === 0 ? (

            <tr>

              <td
                colSpan="8"
                className="text-center py-6 text-gray-500"
              >
                No Payments Found
              </td>

            </tr>

          ) : (

            uniqueOrders.map((order) => (

              <tr
                key={order.orderNumber}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3 font-semibold">
                  {order.orderNumber}
                </td>

                <td className="p-3">
                  {order.userName}
                </td>

                <td className="p-3 text-center">
                  ₹{order.totalAmount}
                </td>

                <td className="p-3 text-center text-green-600 font-semibold">
                  ₹{order.paidAmount}
                </td>

                <td className="p-3 text-center text-red-600 font-semibold">
                  ₹{order.remainingAmount}
                </td>

                <td className="p-3 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.paymentStatus)}`}
                  >
                    {order.paymentStatus}
                  </span>

                </td>

                <td className="p-3 text-center">
                  {formatDate(order.orderDate)}
                </td>

                <td className="p-3 text-center">

                  <button
                    onClick={() =>
                      navigate(`/admin/payments/${order.orderNumber}`)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                  >
                    View
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  </div>
);
}