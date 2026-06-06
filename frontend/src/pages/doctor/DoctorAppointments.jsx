import { useEffect, useState } from "react";
import axios from "axios";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("auth.session") || "{}");
    const userId = session.userId;

    const loadAppointments = async () => {
      try {
        // 1. get doctorId
        const doctorRes = await axios.get(
          `http://localhost:8080/api/hospital-admin/doctors/me?userId=${userId}`
        );

        const doctorId = doctorRes.data.id;

        // 2. get appointments
        const apptRes = await axios.get(
          `http://localhost:8080/api/appointments/doctor/${doctorId}`
        );

        setAppointments(apptRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    loadAppointments();
  }, []);

  const getStatusStyle = (status) => {
    const base = {
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
    };

    switch (status) {
      case "BOOKED":
        return { ...base, background: "#DBEAFE", color: "#1D4ED8" };

      case "CONFIRMED":
        return { ...base, background: "#FEF3C7", color: "#B45309" };

      case "COMPLETED":
        return { ...base, background: "#D1FAE5", color: "#065F46" };

      case "CANCELLED":
        return { ...base, background: "#FEE2E2", color: "#991B1B" };

      default:
        return base;
    }
  };

  return (
    <div style={{ padding: "25px" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "28px", margin: 0 }}>
          My Appointments
        </h2>
        <p style={{ color: "#6B7280" }}>
          All patient appointments assigned to you
        </p>
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          overflowX: "auto",
        }}
      >
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              <th style={{ padding: "12px", color: "#6B7280" }}>Patient</th>
              <th style={{ padding: "12px", color: "#6B7280" }}>Date</th>
              <th style={{ padding: "12px", color: "#6B7280" }}>Time</th>
              <th style={{ padding: "12px", color: "#6B7280" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr
                key={a.id}
                style={{ borderBottom: "1px solid #f1f1f1" }}
              >
                <td style={{ padding: "14px" }}>{a.patientName}</td>
                <td style={{ padding: "14px" }}>{a.appointmentDate}</td>
                <td style={{ padding: "14px" }}>{a.appointmentTime}</td>
                <td style={{ padding: "14px" }}>
                  <span style={getStatusStyle(a.status)}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}