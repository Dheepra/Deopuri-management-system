import { Outlet, NavLink } from "react-router-dom";

export default function DoctorDashboardLayout() {
  const menuStyle = ({ isActive }) => ({
    display: "block",
    padding: "14px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "#fff",
    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
    marginBottom: "8px",
    fontSize: "16px",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "275px",
          background: "#031133",
          color: "#fff",
          padding: "24px 14px",
        }}
      >
        <h2 style={{ marginBottom: "40px" }}>Deopuri</h2>

        <NavLink to="/doctor/dashboard" style={menuStyle}>
  Dashboard
</NavLink>

<NavLink to="/doctor/appointments" style={menuStyle}>
  Appointments
</NavLink>

<NavLink to="/doctor/patients" style={menuStyle}>
  My Patients
</NavLink>

<NavLink to="/doctor/prescriptions" style={menuStyle}>
  Prescriptions
</NavLink>

        <NavLink to="/doctor/reports" style={menuStyle}>
          Reports
        </NavLink>

        <NavLink to="/doctor/profile" style={menuStyle}>
          Profile
        </NavLink>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          background: "#F5F7FB",
          padding: "30px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}