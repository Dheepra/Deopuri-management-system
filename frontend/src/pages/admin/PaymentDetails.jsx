import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPaymentHistory,
  addPayment,
} from "../../services/adminPayments";
import { fetchAllOrders } from "../../services/adminOrders";

export default function PaymentDetails() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [payment, setPayment] = useState({
    amount: "",
    paymentMethod: "CASH",
    remark: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      // Order Details
      const orders = await fetchAllOrders();

      const currentOrder = orders.find(
        (o) => o.orderNumber === orderNumber
      );

      setOrder(currentOrder);

      // Payment History
      const paymentHistory = await getPaymentHistory(orderNumber);

      setHistory(paymentHistory);
    } catch (err) {
      console.log(err);
      alert("Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderNumber]);

  const handleChange = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
      console.log("Save clicked");
    if (!payment.amount || Number(payment.amount) <= 0) {
      alert("Enter valid payment amount.");
      return;
    }

    try {
      await addPayment(orderNumber, {
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        remark: payment.remark,
      });

      alert("Payment Added Successfully.");

      setPayment({
        amount: "",
        paymentMethod: "CASH",
        remark: "",
      });

      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to add payment."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-red-500">
        Order Not Found
      </div>
    );
    
  }
  return (
  <div className="p-6 space-y-6">

    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Payment Details
        </h1>
        <p className="text-gray-500 mt-1">
          Manage order payment information
        </p>
      </div>

      <button
        onClick={() => navigate("/admin/payments")}
        className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
      >
        ← Back
      </button>
    </div>

    {/* Order Details */}
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-blue-700 mb-5">
        📦 Order Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div>
          <p className="text-sm text-gray-500">
            Order Number
          </p>

          <p className="font-semibold">
            {order.orderNumber}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Customer Name
          </p>

          <p className="font-semibold">
            {order.userName}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Order Date
          </p>

          <p className="font-semibold">
            {formatDate(order.orderDate)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Delivery Address
          </p>

          <p className="font-semibold">
            {order.deliveryAddress}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Order Status
          </p>

          <p className="font-semibold text-blue-700">
            {order.status}
          </p>
        </div>

      </div>

    </div>

    {/* Payment Summary */}

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-green-700 mb-5">
        💰 Payment Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-blue-50 rounded-lg p-4">

          <p className="text-sm text-gray-500">
            Total Amount
          </p>

          <p className="text-2xl font-bold text-blue-700">
            ₹{order.totalAmount}
          </p>

        </div>

        <div className="bg-green-50 rounded-lg p-4">

          <p className="text-sm text-gray-500">
            Paid Amount
          </p>

          <p className="text-2xl font-bold text-green-700">
            ₹{order.paidAmount}
          </p>

        </div>

        <div className="bg-red-50 rounded-lg p-4">

          <p className="text-sm text-gray-500">
            Remaining Amount
          </p>

          <p className="text-2xl font-bold text-red-600">
            ₹{order.remainingAmount}
          </p>

        </div>

        <div className="bg-yellow-50 rounded-lg p-4">

          <p className="text-sm text-gray-500">
            Payment Status
          </p>

          <p className="text-lg font-bold text-yellow-700">
            {order.paymentStatus}
          </p>

        </div>

      </div>

    </div>

        {/* Add Payment */}

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-indigo-700 mb-5">
        💳 Add Payment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Payment Amount
          </label>

          <input
            type="number"
            name="amount"
            value={payment.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Payment Method
          </label>

          <select
            name="paymentMethod"
            value={payment.paymentMethod}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Remark
          </label>

          <input
            type="text"
            name="remark"
            value={payment.remark}
            onChange={handleChange}
            placeholder="Remark"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

      </div>

      <div className="mt-6 flex justify-end">

        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Save Payment
        </button>

      </div>

    </div>

        {/* Payment History */}

    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-bold text-purple-700 mb-5">
        📋 Payment History
      </h2>

      {history.length === 0 ? (

        <div className="text-center py-10 text-gray-500">
          No Payment History Found
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-gray-100">

                <th className="text-left p-3 border">
                  Date
                </th>

                <th className="text-center p-3 border">
                  Amount
                </th>

                <th className="text-center p-3 border">
                  Payment Method
                </th>

                <th className="text-center p-3 border">
                  Remark
                </th>

                <th className="text-center p-3 border">
                  Balance After Payment
                </th>

              </tr>

            </thead>

            <tbody>

              {history.map((item) => (

                <tr
                  key={item.id}
                  className="hover:bg-gray-50"
                >

                  <td className="p-3 border">
                    {formatDate(item.paymentDate)}
                  </td>

                  <td className="p-3 border text-center font-semibold text-green-700">
                    ₹{item.amount}
                  </td>

                  <td className="p-3 border text-center">
                    {item.paymentMethod}
                  </td>

                  <td className="p-3 border text-center">
                    {item.remark || "-"}
                  </td>

                  <td className="p-3 border text-center font-semibold text-red-600">
                    ₹{item.balanceAfterPayment}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  </div>
);
}
  
