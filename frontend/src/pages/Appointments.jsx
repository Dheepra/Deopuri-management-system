import { useEffect, useState } from "react";
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
const [errors, setErrors] = useState({});


useEffect(() => {
  axios.get("http://localhost:8080/api/hospitals")
    .then(res => {
      setHospitals(res.data);
    })
    .catch(err => console.log(err));
}, []);



useEffect(() => {
  const loadDoctors = async () => {
    if (!formData.hospitalAdminId) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/hospital-admin/doctors/hospital/${formData.hospitalAdminId}`
      );

      setDoctors(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  loadDoctors();
}, [formData.hospitalAdminId]);

const clearError = (name) => {
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }
};

const handleHospitalChange = async (e) => {

  const hospitalAdminId = e.target.value;

  setFormData({
    ...formData,
    hospitalAdminId,
    doctorId: ""
  });
  clearError("hospitalAdminId");

  try {

    const response = await axios.get(
      `http://localhost:8080/api/hospital-admin/doctors/hospital/${hospitalAdminId}`
    );

    setDoctors(response.data);

  } catch (error) {
    console.log(error);
  }
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
              <label className="block">
                <span className={labelClass}>🏥 Hospital</span>
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

              <label className="block">
                <span className={labelClass}>👨‍⚕️ Doctor</span>
                <select
                  className={inputClass}
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
                    </option>
                  ))}
                </select>
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
