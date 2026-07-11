import { useState } from "react";
import axios from "axios";
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
  "w-full rounded-xl border border-ink-200 bg-ink-50/50 px-3 py-2.5 text-sm text-ink-900 outline-none";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink-700";
const errorClass = "mt-1 text-xs text-red-600";

export default function AppointmentReview({
  reviewData,
  setStep,
  resetAppointmentFlow
}){
  const [errors, setErrors] = useState({});

  if (!reviewData?.formData) {
    return <p>No Data Found</p>;
  }

  const { formData, doctors = [], hospitals = [] } = reviewData;

  const doctor = doctors.find(
    d => d.id === Number(formData.doctorId)
  );

  const hospital = hospitals.find(
    h => h.id === Number(formData.hospitalAdminId)
  );

  const handleConfirm = async () => {
    const next = validate(formData);
    setErrors(next);

    if (Object.values(next).some(Boolean)) {
      return;
    }

    try {
      const payload = {
        ...formData,
        doctorId: Number(formData.doctorId),
        hospitalAdminId: Number(formData.hospitalAdminId)
      };

      console.log("FINAL PAYLOAD:", payload);

      await axios.post(
        "http://localhost:8080/api/appointments",
        payload
      );

      alert("Appointment Booked Successfully");

      // ✅ FULL RESET AFTER SUCCESS


  resetAppointmentFlow();


    } catch (error) {
      console.log(error.response?.data || error);
      alert("Error booking appointment");
    }
  };

  const handleEdit = () => {
    setStep("form"); // keep data safe
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">📋</span>
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Review Appointment</h2>
            <p className="text-xs text-ink-500">Confirm the details before booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>🧑 Patient Name</label>
            <input className={inputClass} value={formData.patientName} readOnly />
            {errors.patientName && <p className={errorClass}>{errors.patientName}</p>}
          </div>

          <div>
            <label className={labelClass}>📱 Phone</label>
            <input className={inputClass} value={formData.patientMobile} readOnly />
            {errors.patientMobile && <p className={errorClass}>{errors.patientMobile}</p>}
          </div>

          <div>
            <label className={labelClass}>✉️ Email</label>
            <input className={inputClass} value={formData.patientEmail} readOnly />
            {errors.patientEmail && <p className={errorClass}>{errors.patientEmail}</p>}
          </div>

          <div>
            <label className={labelClass}>🎂 Age</label>
            <input className={inputClass} value={formData.patientAge} readOnly />
            {errors.patientAge && <p className={errorClass}>{errors.patientAge}</p>}
          </div>

          <div>
            <label className={labelClass}>⚧ Gender</label>
            <input className={inputClass} value={formData.patientGender} readOnly />
            {errors.patientGender && <p className={errorClass}>{errors.patientGender}</p>}
          </div>

          <div>
            <label className={labelClass}>🏥 Hospital</label>
            <input className={inputClass} value={hospital?.shopName || ""} readOnly />
            {errors.hospitalAdminId && <p className={errorClass}>{errors.hospitalAdminId}</p>}
          </div>

          <div>
            <label className={labelClass}>👨‍⚕️ Doctor</label>
            <input
              className={inputClass}
              value={`Dr. ${doctor?.firstName || ""} ${doctor?.lastName || ""}`}
              readOnly
            />
            {errors.doctorId && <p className={errorClass}>{errors.doctorId}</p>}
          </div>

          <div>
            <label className={labelClass}>📅 Appointment Date</label>
            <input className={inputClass} value={formData.appointmentDate} readOnly />
            {errors.appointmentDate && <p className={errorClass}>{errors.appointmentDate}</p>}
          </div>

          <div>
            <label className={labelClass}>⏰ Appointment Time</label>
            <input className={inputClass} value={formData.appointmentTime} readOnly />
            {errors.appointmentTime && <p className={errorClass}>{errors.appointmentTime}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>📝 Notes</label>
            <textarea className={inputClass} value={formData.notes} rows={3} readOnly />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
          >
            ✏️ Edit Details
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
          >
            ✅ Confirm Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
