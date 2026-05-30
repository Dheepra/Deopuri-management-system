import { Outlet } from "react-router-dom";

export default function DoctorDashboardLayout() {
  return (
    <div>
      <h2>Doctor Layout</h2>
      <Outlet />
    </div>
  );
}