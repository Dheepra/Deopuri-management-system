import DoctorAppointments from "./DoctorAppointments";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/useAuth.js";

export default function DoctorDashboard() {

  const navigate = useNavigate();
const [open, setOpen] = useState(false);
const { user } = useAuth();
const email = user?.email;

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
    setOpen(false);  
  navigate("/login");
};

return (
<motion.div
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  className="space-y-8"
>

  <header
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  }}
>

  {/* LEFT SIDE (SEARCH BAR) */}
  <input
    placeholder="Search patients, reports..."
    style={{
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      width: "850px",
    }}
  />

  {/* RIGHT SIDE (EMAIL + DROPDOWN) */}
  <div style={{ position: "relative" }}>

  {/* PROFILE BUTTON */}
  <div
    onClick={() => setOpen(!open)}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
    }}
  >

    {/* CIRCLE AVATAR */}
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "#0f8b5f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
      }}
    >
      D
    </div>

    {/* EMAIL + ROLE */}
    <div style={{ textAlign: "left" }}>
      <div style={{ fontWeight: "600", color: "#08152F" }}>
        {email}
      </div>
      <div style={{ fontSize: "12px", color: "#56657A" }}>
        Doctor
      </div>
    </div>



  </div>

  {/* DROPDOWN */}
  {open && (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "55px",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        width: "160px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >

      <div
        onClick={(e) => {
          e.stopPropagation();   // ✅ important fix
          handleLogout();
        }}
        style={{
          padding: "10px",
          cursor: "pointer",
          color: "red",
          fontWeight: "600",
        }}
      >
        Sign Out
      </div>

    </div>
  )}

</div>

</header>


  {/* KPI STYLE CARDS (like hospital StatCard) */}
  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

    <div className="bg-white p-5 rounded-xl">My Patients<br/><b>45</b></div>
    <div className="bg-white p-5 rounded-xl">Today Appointments<br/><b>12</b></div>
    <div className="bg-white p-5 rounded-xl">Prescriptions<br/><b>18</b></div>
    <div className="bg-white p-5 rounded-xl">Pending Reports<br/><b>4</b></div>

  </section>

  {/* QUICK ACTIONS (hospital style) */}
  <div className="bg-white p-6 rounded-2xl">
    <h2>Quick Actions</h2>

    <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="border p-4 rounded-xl">New Prescription</div>
      <div className="border p-4 rounded-xl">View Patients</div>
      <div className="border p-4 rounded-xl">Upload Reports</div>
    </div>
  </div>

  {/* TABLE SECTION (hospital style) */}
  <div className="grid grid-cols-3 gap-6">

    <div className="col-span-2 bg-white p-6 rounded-2xl">
      <h2>Today's Patients</h2>
      <p>Rahul, Neha, Aman...</p>
    </div>

    <div className="bg-white p-6 rounded-2xl">
      <h2>Recent Prescriptions</h2>
      <p>PCM</p>
      <p>Azithromycin</p>
    </div>

  </div>

</motion.div>
);
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "22px",
      }}
    >
      <div
        style={{
          color: "#65748B",
          fontSize: "13px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "42px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionCard({ title, desc }) {
  return (
    <div
      style={{
        border: "1px solid #E6EAF0",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <h3>{title}</h3>
      <p style={{ color: "#6B7280" }}>{desc}</p>
    </div>
  );
}