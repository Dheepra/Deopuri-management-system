import { useEffect, useState } from "react";
import {
  createOffer,
  updateOffer,
  getAllOffers,
} from "../../services/offers";
import { required, runValidators } from "../../utils/validators.js";

// Numeric validator: value must parse to a number strictly greater than 0.
const positiveNumber = (label) => (value) => {
  const n = Number(value);
  if (value === "" || value == null || Number.isNaN(n)) return `${label} must be a number`;
  return n > 0 ? null : `${label} must be greater than 0`;
};

// Percent cap: value must be <= 100 (only applied to PERCENTAGE offers).
const maxPercent = (value) =>
  Number(value) > 100 ? "Percentage cannot exceed 100" : null;

function validate(values) {
  const discountValidators = [
    required("Discount"),
    positiveNumber("Discount"),
  ];
  if (values.offerType === "PERCENTAGE") discountValidators.push(maxPercent);

  let endDateError = runValidators(values.endDate, required("End date"));
  if (!endDateError && values.startDate && values.endDate) {
    if (new Date(values.endDate) <= new Date(values.startDate)) {
      endDateError = "End date must be after the start date";
    }
  }

  return {
    offerName: runValidators(values.offerName, required("Offer name")),
    description: runValidators(values.description, required("Description")),
    offerType: runValidators(values.offerType, required("Offer type")),
    discountValue: runValidators(values.discountValue, ...discountValidators),
    startDate: runValidators(values.startDate, required("Start date")),
    endDate: endDateError,
  };
}

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

  const [errors, setErrors] = useState({});

  // Clear a single field's error as soon as the user edits it.
  const clearError = (name) =>
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

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
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate({
      offerName,
      description,
      offerType,
      discountValue,
      startDate,
      endDate,
    });

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

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

      <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-ink-900 mb-6">
        🎁 Offer Management
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">🎁</span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-ink-900">
              {editingId ? "Edit offer" : "Create offer"}
            </h3>
            <p className="truncate text-xs text-ink-500">
              {editingId ? "Update this offer's details" : "Set up a new discount offer"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏷️ Offer name</span>
            <input
              type="text"
              value={offerName}
              onChange={(e) => { setOfferName(e.target.value); clearError("offerName"); }}
              placeholder="e.g. Monsoon Sale"
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {errors.offerName && <p className="mt-1 text-xs text-red-600">{errors.offerName}</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">📝 Description</span>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearError("description"); }}
              placeholder="Short description of the offer…"
              rows={3}
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">🎚️ Offer type</span>
              <select
                value={offerType}
                onChange={(e) => { setOfferType(e.target.value); clearError("offerType"); clearError("discountValue"); }}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat</option>
              </select>
              {errors.offerType && <p className="mt-1 text-xs text-red-600">{errors.offerType}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">
                {offerType === "PERCENTAGE" ? "💯 Discount (%)" : "💰 Discount (₹)"}
              </span>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => { setDiscountValue(e.target.value); clearError("discountValue"); }}
                placeholder={offerType === "PERCENTAGE" ? "e.g. 20" : "e.g. 100"}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {errors.discountValue && <p className="mt-1 text-xs text-red-600">{errors.discountValue}</p>}
            </label>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">📅 Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); clearError("startDate"); clearError("endDate"); }}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">📆 End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); clearError("endDate"); }}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
            </label>

          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-semibold text-ink-700">✅ Active</span>
          </label>

        </div>

        {/* Footer (sticky) */}
        <div className="flex gap-3 border-t border-ink-100 px-5 py-4 pb-safe">
          <button
            type="button"
            onClick={clearForm}
            className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
          >✖ Cancel</button>

          <button
            type="submit"
            className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
          >{editingId ? "✅ Update Offer" : "✅ Create Offer"}</button>
        </div>

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