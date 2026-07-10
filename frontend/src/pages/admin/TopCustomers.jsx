import { useEffect, useState } from "react";
import {
  getTopCustomers,
  getAllOffers,
  assignOffer,
} from "../../services/offers";

export default function TopCustomers() {

  const [customers, setCustomers] = useState([]);
  const [offers, setOffers] = useState([]);

  const [period, setPeriod] = useState("1M");

  const [showModal, setShowModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedOffer, setSelectedOffer] = useState("");

  useEffect(() => {
    loadCustomers();
  }, [period]);

  const loadCustomers = async () => {
    try {

      const data = await getTopCustomers(period);

      setCustomers(data);

    } catch (error) {
      console.log(error);
      alert("Failed to load customers");
    }
  };

  const openAssignModal = async (customer) => {

    try {

      const data = await getAllOffers();

      setOffers(data);

      setSelectedUser(customer);

      setSelectedOffer("");

      setShowModal(true);

    } catch (error) {

      console.log(error);

      alert("Unable to load offers");

    }

  };

  const handleAssignOffer = async () => {

    if (!selectedOffer) {

      alert("Please select an offer");

      return;

    }

    try {

      await assignOffer({

        userId: selectedUser.userId,

        offerId: Number(selectedOffer),

      });

      alert("Offer Assigned Successfully");

      setShowModal(false);

    } catch (error) {

      console.log(error);

      alert("Failed to assign offer");

    }

  };

  return (

    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">

          Top Customers

        </h1>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >

          <option value="1M">1 Month</option>

          <option value="3M">3 Months</option>

          <option value="6M">6 Months</option>

          <option value="9M">9 Months</option>

          <option value="1Y">1 Year</option>

        </select>

      </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="px-4 py-3">Rank</th>

              <th className="px-4 py-3">Customer</th>

              <th className="px-4 py-3">Shop</th>

              <th className="px-4 py-3">Purchase</th>

              <th className="px-4 py-3">Orders</th>

              <th className="px-4 py-3">Action</th>

            </tr>

          </thead>

          <tbody>

            {customers.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500"
                >
                  No Customers Found
                </td>

              </tr>

            ) : (

              customers.map((customer) => (

                <tr
                  key={customer.userId}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="px-4 py-3 text-center">

                    {customer.rank === 1
                      ? "🥇"
                      : customer.rank === 2
                      ? "🥈"
                      : customer.rank === 3
                      ? "🥉"
                      : customer.rank}

                  </td>

                  <td className="px-4 py-3">

                    {customer.userName}

                  </td>

                  <td className="px-4 py-3">

                    {customer.shopName}

                  </td>

                  <td className="px-4 py-3 font-semibold text-green-600">

                    ₹ {customer.totalPayment}

                  </td>

                  <td className="px-4 py-3">

                    {customer.totalOrders}

                  </td>

                  <td className="px-4 py-3">

                    <button
                      onClick={() => openAssignModal(customer)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Assign Offer
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">

            <h2 className="text-2xl font-bold mb-5">

              Assign Offer

            </h2>

            <div className="mb-4">

              <label className="block mb-2 font-medium">

                Customer

              </label>

              <input
                value={selectedUser?.userName || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-100"
              />

            </div>

            <div className="mb-5">

              <label className="block mb-2 font-medium">

                Select Offer

              </label>

              <select
                value={selectedOffer}
                onChange={(e) =>
                  setSelectedOffer(e.target.value)
                }
                className="w-full border rounded p-2"
              >

                <option value="">

                  Select Offer

                </option>

                {offers.map((offer) => (

                  <option
                    key={offer.id}
                    value={offer.id}
                  >

                    {offer.offerName} (
                    {offer.offerType === "PERCENTAGE"
                      ? `${offer.discountValue}%`
                      : `₹${offer.discountValue}`}
                    )

                  </option>

                ))}

              </select>

            </div>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignOffer}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Assign
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}