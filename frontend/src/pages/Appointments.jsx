import { useEffect, useState } from "react";
import { http } from "../services/http.js";
import {
  email as emailValidator,
  phone10,
  required,
  runValidators,
} from "../utils/validators.js";

// Date must not be earlier than today (local).
const notPast = (value) => {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(`${value}T00:00:00`);
  return picked < today ? "Date cannot be in the past" : null;
};

function validate(values) {
  return {
    patientName: runValidators(values.patientName, required("Patient name")),
    patientMobile: runValidators(values.patientMobile, required("Phone number"), phone10),
    patientEmail: runValidators(values.patientEmail, required("Email"), emailValidator),
    patientAge: runValidators(values.patientAge, required("Age")),
    patientGender: runValidators(values.patientGender, required("Gender")),
    hospitalAdminId: runValidators(values.hospitalAdminId, required("Hospital")),
    doctorId: runValidators(values.doctorId, required("Doctor")),
    appointmentDate: runValidators(values.appointmentDate, required("Date")) || notPast(values.appointmentDate),
    appointmentTime: runValidators(values.appointmentTime, required("Time")),
  };
}

const inputClass =
  "w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function AppointmentBooking({
  formData,
  setFormData,
  setReviewData,
  setStep
}){


  const [doctors, setDoctors] = useState([]);
const [hospitals, setHospitals] = useState([]);
const [doctorsLoading, setDoctorsLoading] = useState(false);
const [qrUrl, setQrUrl] = useState("");
const [errors, setErrors] = useState({});


useEffect(() => {
  http.get("/deopuri/hospitals")
    .then(res => {
      setHospitals(res.data);
    })
    .catch(err => console.log(err));
}, []);



// Load the chosen hospital's doctors whenever the hospital changes.
useEffect(() => {
  const loadDoctors = async () => {
    if (!formData.hospitalAdminId) {
      setDoctors([]);
      return;
    }
    setDoctorsLoading(true);
    try {
      const response = await http.get(
        `/deopuri/hospital-admin/doctors/hospital/${formData.hospitalAdminId}`
      );
      setDoctors(response.data || []);
    } catch (error) {
      console.log(error);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  loadDoctors();
}, [formData.hospitalAdminId]);

const clearError = (name) => {
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }
};

const handleHospitalChange = (e) => {
  // Reset the doctor when the hospital changes; the effect above loads the new list.
  setFormData({
    ...formData,
    hospitalAdminId: e.target.value,
    doctorId: ""
  });
  clearError("hospitalAdminId");
};

const handleChange = (e) => {
  const { name, value } = e.target;
  clearError(name);

  if (name === "patientMobile") {
    const mobile = value.replace(/\D/g, "").slice(0, 10);

    setFormData({
      ...formData,
      [name]: mobile
    });
    return;
  }

  setFormData({
    ...formData,
    [name]: value
  });
};

 const handleSubmit = (e) => {
  e.preventDefault();

  const next = validate(formData);
  setErrors(next);

  if (Object.values(next).some(Boolean)) {
    return;
  }

  setReviewData({
    formData,
    doctors,
    hospitals
  });

  setStep("review");
};




  // Payment context derived from the chosen doctor + hospital.
  const selectedDoctor = doctors.find((d) => String(d.id) === String(formData.doctorId));
  const selectedHospital = hospitals.find((h) => String(h.id) === String(formData.hospitalAdminId));
  const fee = selectedDoctor?.consultationFee;
  const feeNum = Number(fee) || 0;
  const upiId = selectedHospital?.upiId;
  const method = formData.paymentMethod || "UPI";
  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(selectedHospital?.shopName || "Hospital")}` +
      `${feeNum > 0 ? `&am=${feeNum}` : ""}&cu=INR&tn=${encodeURIComponent("Consultation fee")}`
    : null;

  // Build a scannable QR for the UPI link so desktop users can pay from their phone.
  // Dynamic import keeps the page working even if the "qrcode" package isn't installed yet.
  useEffect(() => {
    if (method !== "UPI" || !upiLink) {
      setQrUrl("");
      return;
    }
    let alive = true;
    import("qrcode")
      .then((m) => (m.default || m).toDataURL(upiLink, { width: 220, margin: 1 }))
      .then((url) => { if (alive) setQrUrl(url); })
      .catch(() => { if (alive) setQrUrl(""); });
    return () => { alive = false; };
  }, [upiLink, method]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">📅</span>
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Book Appointment</h2>
            <p className="text-xs text-ink-500">Fill in the patient &amp; appointment details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Patient details */}
          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-3">
            <span className="mb-3 block text-sm font-bold text-ink-800">🧑 Patient details</span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>🧑 Patient name</span>
                <input
                  className={inputClass}
                  name="patientName"
                  value={formData.patientName}
                  placeholder="Full name"
                  onChange={handleChange}
                />
                {errors.patientName && <p className={errorClass}>{errors.patientName}</p>}
              </label>

              <label className="block">
                <span className={labelClass}>📱 Phone</span>
                <input
                  className={inputClass}
                  name="patientMobile"
                  value={formData.patientMobile}
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  maxLength={10}
                  onChange={handleChange}
                />
                {errors.patientMobile && <p className={errorClass}>{errors.patientMobile}</p>}
              </label>

              <label className="block">
                <span className={labelClass}>✉️ Email</span>
                <input
                  className={inputClass}
                  type="email"
                  name="patientEmail"
                  value={formData.patientEmail}
                  placeholder="name@example.com"
                  onChange={handleChange}
                />
                {errors.patientEmail && <p className={errorClass}>{errors.patientEmail}</p>}
              </label>

              <label className="block">
                <span className={labelClass}>🎂 Age</span>
                <input
                  className={inputClass}
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  placeholder="Age"
                  min="1"
                  max="120"
                  onChange={handleChange}
                />
                {errors.patientAge && <p className={errorClass}>{errors.patientAge}</p>}
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClass}>⚧ Gender</span>
                <select
                  className={inputClass}
                  name="patientGender"
                  value={formData.patientGender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.patientGender && <p className={errorClass}>{errors.patientGender}</p>}
              </label>
            </div>
          </div>

          {/* Appointment details */}
          <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-3">
            <span className="mb-3 block text-sm font-bold text-ink-800">🏥 Appointment details</span>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Step 1: pick the hospital */}
              <label className="block sm:col-span-2">
                <span className={labelClass}>🏥 Hospital <span className="font-normal text-brand-600">— select this first</span></span>
                <select
                  className={inputClass}
                  name="hospitalAdminId"
                  value={formData.hospitalAdminId}
                  onChange={handleHospitalChange}
                >
                  <option value="">Select hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.shopName}
                    </option>
                  ))}
                </select>
                {errors.hospitalAdminId && <p className={errorClass}>{errors.hospitalAdminId}</p>}
              </label>

              {/* Step 2: pick a doctor from that hospital (disabled until a hospital is chosen) */}
              <label className="block sm:col-span-2">
                <span className={labelClass}>👨‍⚕️ Doctor</span>
                <select
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400`}
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  disabled={!formData.hospitalAdminId || doctorsLoading}
                >
                  <option value="">
                    {!formData.hospitalAdminId
                      ? "Select a hospital first"
                      : doctorsLoading
                        ? "Loading doctors…"
                        : doctors.length === 0
                          ? "No doctors at this hospital"
                          : "Select doctor"}
                  </option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
                    </option>
                  ))}
                </select>
                {formData.hospitalAdminId && !doctorsLoading && doctors.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">This hospital has no doctors listed yet.</p>
                )}
                {errors.doctorId && <p className={errorClass}>{errors.doctorId}</p>}
              </label>

              <label className="block">
                <span className={labelClass}>📅 Date</span>
                <input
                  className={inputClass}
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                />
                {errors.appointmentDate && <p className={errorClass}>{errors.appointmentDate}</p>}
              </label>

              <label className="block">
                <span className={labelClass}>⏰ Time</span>
                <input
                  className={inputClass}
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                />
                {errors.appointmentTime && <p className={errorClass}>{errors.appointmentTime}</p>}
              </label>
            </div>
          </div>

          {/* Payment */}
          {formData.doctorId && (
            <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-ink-800">💳 Payment</span>
                {fee != null && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                    Consultation fee: ₹{Number(fee).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Method toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "UPI" })}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${method === "UPI" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600 hover:bg-ink-50"}`}
                >
                  📲 Pay online (UPI)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "CASH", paymentRef: "" })}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${method === "CASH" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600 hover:bg-ink-50"}`}
                >
                  🏥 Pay at hospital
                </button>
              </div>

              {method === "UPI" && (
                <div className="mt-3 space-y-2">
                  {upiId ? (
                    <>
                      {feeNum === 0 && (
                        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                          This doctor’s consultation fee isn’t set — you can still pay any amount to the UPI ID, or choose “Pay at hospital”.
                        </p>
                      )}

                      {/* Scan on phone (works on desktop too) */}
                      {qrUrl && (
                        <div className="flex flex-col items-center gap-1 rounded-xl border border-ink-100 bg-white p-3">
                          <img src={qrUrl} alt="UPI QR code" className="h-40 w-40" />
                          <p className="text-xs font-semibold text-ink-600">📷 Scan with any UPI app (GPay / PhonePe / Paytm)</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-100 bg-white p-2.5 text-sm">
                        <span className="text-ink-500">UPI ID:</span>
                        <span className="font-semibold text-ink-900">{upiId}</span>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard?.writeText(upiId); }}
                          className="ml-auto rounded-lg border border-ink-200 px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                        >
                          Copy
                        </button>
                      </div>

                      {/* Deep link — only useful on a phone */}
                      <a
                        href={upiLink}
                        className="block w-full rounded-xl bg-brand-600 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-brand-700"
                      >
                        📲 Pay {feeNum > 0 ? `₹${feeNum.toLocaleString("en-IN")}` : ""} via UPI app
                      </a>
                      <p className="text-xs text-ink-400">
                        On a phone this opens your UPI app. On a computer, scan the QR above with your phone.
                        After paying, enter the reference below.
                      </p>

                      <input
                        className={inputClass}
                        name="paymentRef"
                        value={formData.paymentRef}
                        onChange={handleChange}
                        placeholder="UPI reference / transaction ID (after paying)"
                      />
                    </>
                  ) : (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                      This hospital hasn’t set up online payment yet. Please choose “Pay at hospital”.
                    </p>
                  )}
                </div>
              )}

              {method === "CASH" && (
                <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-ink-500">
                  🏥 Pay {fee != null ? `₹${Number(fee).toLocaleString("en-IN")}` : "the fee"} at the reception when you arrive. The hospital will mark it paid.
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <label className="block">
            <span className={labelClass}>📝 Notes (optional)</span>
            <textarea
              className={inputClass}
              name="notes"
              value={formData.notes}
              placeholder="Write notes (optional)"
              rows={3}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
          >
            ✅ Review Appointment
          </button>

        </form>
      </div>
    </div>
  );
}
