import { useState } from "react";
import Hero from "../components/home/Hero.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import About from "../components/home/About.jsx";
import AppointmentBooking from "./Appointments";
import AppointmentReview from "./AppointmentReview";

export default function Home() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [step, setStep] = useState("form");
  const [reviewData, setReviewData] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    patientMobile: "",
    patientEmail: "",
    patientAge: "",
    patientGender: "",
    hospitalAdminId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });

 const resetAppointmentFlow = () => {
  setShowAppointmentForm(false);
  setStep("form");
  setReviewData(null);

  setFormData({
    patientName: "",
    patientMobile: "",
    patientEmail: "",
    patientAge: "",
    patientGender: "",
    hospitalAdminId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });
};
  

 return (
  <>
    <Hero />
    <FeaturedProducts />
    <About />

    <button
  onClick={() => {
    resetAppointmentFlow();
    setShowAppointmentForm(true);
  }}
  className="fixed right-10 bottom-10 z-50
  flex items-center gap-2
  bg-[#157d58]
  text-white font-semibold
  px-5 py-3 rounded-full shadow-lg"
>
  📅 Book Appointment
</button>

    {showAppointmentForm && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

    <div className="relative bg-white p-4 rounded-lg max-h-[90vh] overflow-y-auto">

      {/* CLOSE BUTTON */}
      <button
  onClick={resetAppointmentFlow}
  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
>
  ✕
</button>

      {/* FLOW */}
      {step === "form" ? (
        <AppointmentBooking
          formData={formData}
          setFormData={setFormData}
          setReviewData={setReviewData}
          setStep={setStep}
        />
      ) : (
        <AppointmentReview
          reviewData={reviewData}
          setStep={setStep}
          setShowAppointmentForm={setShowAppointmentForm}
          setReviewData={setReviewData}
          resetAppointmentFlow={resetAppointmentFlow}
        />
      )}

    </div>
  </div>
)}

  </>
);
}