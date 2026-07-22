import { useEffect, useState } from "react";
import { getUserOffers } from "../../services/offers";
import { getAuthUser } from "../../services/auth";

export default function MyOffers() {

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getAuthUser();

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {

    try {

      const data = await getUserOffers(user?.userId);

      setOffers(data);

    } catch (error) {

      console.log(error);

      alert("Failed to load offers");

    } finally {

      setLoading(false);

    }

  };

  return (

  <div className="p-6">

    <h1 className="text-3xl font-bold mb-6">
      🎁 My Offers
    </h1>

    {loading ? (

      <div className="text-center py-10">
        Loading...
      </div>

    ) : offers.length === 0 ? (

      <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
        No Offers Available
      </div>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {offers.map((offer) => (

          <div
            key={offer.id}
            className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition"
          >

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl p-4">
              <h2 className="text-xl font-bold">
                🎁 {offer.offerName}
              </h2>
            </div>

            <div className="p-5 space-y-3">

              <p>
                <span className="font-semibold">Discount :</span>{" "}
                {offer.offerType === "PERCENTAGE"
                  ? `${offer.discountValue}%`
                  : `₹ ${offer.discountValue}`}
              </p>

              <p>
                <span className="font-semibold">Shop :</span>{" "}
                {offer.shopName}
              </p>

              <p>
                <span className="font-semibold">Assigned Date :</span>{" "}
                {offer.assignedDate?.substring(0, 10)}
              </p>
              <p>
  <span className="font-semibold">Expiry Date :</span>{" "}
  {offer.endDate?.substring(0, 10)}
</p>

              <div className="flex gap-2 mt-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm text-white ${
                    offer.claimed
                      ? "bg-green-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {offer.claimed ? "Claimed" : "Not Claimed"}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm text-white ${
                    offer.expired
                      ? "bg-red-600"
                      : "bg-blue-600"
                  }`}
                >
                  {offer.expired ? "Expired" : "Active"}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

);

}