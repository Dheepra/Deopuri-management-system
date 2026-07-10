import { useEffect, useState } from "react";
import {
  createOffer,
  updateOffer,
  getAllOffers,
} from "../../services/offers";

export default function Offers() {

  const [offers, setOffers] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [offerName, setOfferName] = useState("");
  const [description, setDescription] = useState("");
  const [offerType, setOfferType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await getAllOffers();
      setOffers(data);
    } catch (error) {
      console.log(error);
      alert("Failed to load offers");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setOfferName("");
    setDescription("");
    setOfferType("PERCENTAGE");
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
    setActive(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      offerName,
      description,
      offerType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      active,
    };

    try {

      if (editingId) {
        await updateOffer(editingId, payload);
        alert("Offer Updated Successfully");
      } else {
        await createOffer(payload);
        alert("Offer Created Successfully");
      }

      clearForm();
      loadOffers();

    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  const handleEdit = (offer) => {

    setEditingId(offer.id);

    setOfferName(offer.offerName);
    setDescription(offer.description);
    setOfferType(offer.offerType);
    setDiscountValue(offer.discountValue);
    setStartDate(offer.startDate);
    setEndDate(offer.endDate);
    setActive(offer.active);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Offer Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4"
      >

        <div>

          <label className="block font-medium mb-1">
            Offer Name
          </label>

          <input
            type="text"
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
            className="w-full border rounded p-2"
            required
          />

        </div>

        <div>

          <label className="block font-medium mb-1">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="block font-medium mb-1">
              Offer Type
            </label>

            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className="w-full border rounded p-2"
            >

              <option value="PERCENTAGE">
                Percentage
              </option>

              <option value="FLAT">
                Flat
              </option>

            </select>

          </div>

          <div>

            <label className="block font-medium mb-1">
              Discount
            </label>

            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full border rounded p-2"
              required
            />

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="block font-medium mb-1">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded p-2"
              required
            />

          </div>

          <div>

            <label className="block font-medium mb-1">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded p-2"
              required
            />

          </div>

        </div>

        <div className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />

          <label>Active</label>

        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {editingId ? "Update Offer" : "Create Offer"}
        </button>

      </form>
      
            {/* Offer List */}

      <div className="mt-8 bg-white shadow rounded-lg">

        <div className="px-6 py-4 border-b">

          <h2 className="text-2xl font-bold">
            All Offers
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-4 py-3 text-left">Offer Name</th>

                <th className="px-4 py-3 text-left">Description</th>

                <th className="px-4 py-3 text-left">Type</th>

                <th className="px-4 py-3 text-left">Discount</th>

                <th className="px-4 py-3 text-left">Start</th>

                <th className="px-4 py-3 text-left">End</th>

                <th className="px-4 py-3 text-left">Status</th>

                <th className="px-4 py-3 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {offers.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500"
                  >
                    No Offers Found
                  </td>

                </tr>

              ) : (

                offers.map((offer) => (

                  <tr
                    key={offer.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-4 py-3 font-semibold">
                      {offer.offerName}
                    </td>

                    <td className="px-4 py-3">
                      {offer.description}
                    </td>

                    <td className="px-4 py-3">
                      {offer.offerType}
                    </td>

                    <td className="px-4 py-3">

                      {offer.offerType === "PERCENTAGE"
                        ? `${offer.discountValue}%`
                        : `₹ ${offer.discountValue}`}

                    </td>

                    <td className="px-4 py-3">
                      {offer.startDate}
                    </td>

                    <td className="px-4 py-3">
                      {offer.endDate}
                    </td>

                    <td className="px-4 py-3">

                      {offer.active ? (

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                          Active

                        </span>

                      ) : (

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">

                          Inactive

                        </span>

                      )}

                    </td>

                    <td className="px-4 py-3 text-center">

                      <button
                        onClick={() => handleEdit(offer)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                      >

                        Edit

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