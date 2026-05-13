import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';

import Signup from '../pages/Signup.jsx';
import Login from '../pages/Login.jsx';

import CompanyDashboard from '../pages/admin/Dashboard.jsx';
import CompanyDashboardLayout from '../layouts/CompanyDashboardLayout.jsx';

import HospitalDashboardLayout from '../layouts/HospitalDashboardLayout.jsx';
import HospitalDashboard from '../pages/hospital/HospitalDashboard.jsx';
import Doctors from '../pages/hospital/Doctors.jsx';
import Staff from '../pages/hospital/Staff.jsx';
import Patients from '../pages/hospital/Patients.jsx';
import Inventory from '../pages/hospital/Inventory.jsx';
import Appointments from '../pages/hospital/Appointments.jsx';
import Reports from '../pages/hospital/Reports.jsx';
import HospitalSettings from '../pages/hospital/Settings.jsx';

import MedicalDashboardLayout from '../layouts/MedicalDashboardLayout.jsx';
import MedicalDashboard from '../pages/medical/MedicalDashboard.jsx';
import Catalog from '../pages/medical/Catalog.jsx';
import Orders from '../pages/medical/Orders.jsx';
import MedicalSettings from '../pages/medical/Settings.jsx';

import { ProtectedRoute } from '../auth/ProtectedRoute.jsx';
import { ROLES } from '../auth/roles.js';

// One Login page for every role. After auth, LoginForm reads ROLE_HOME[session.role]
// and navigates to the appropriate console.
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/register"        element={<Signup />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized"    element={<Unauthorized />} />

      {/* COMPANY_ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.COMPANY_ADMIN]}>
            <CompanyDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index             element={<CompanyDashboard />} />
        <Route path="dashboard"  element={<CompanyDashboard />} />
      </Route>

      {/* HOSPITAL_ADMIN */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN]}>
            <HospitalDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index               element={<HospitalDashboard />} />
        <Route path="dashboard"    element={<HospitalDashboard />} />
        <Route path="doctors"      element={<Doctors />} />
        <Route path="staff"        element={<Staff />} />
        <Route path="patients"     element={<Patients />} />
        <Route path="inventory"    element={<Inventory />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="reports"      element={<Reports />} />
        <Route path="settings"     element={<HospitalSettings />} />
      </Route>

      {/* MEDICAL_ADMIN */}
      <Route
        path="/medical"
        element={
          <ProtectedRoute roles={[ROLES.MEDICAL_ADMIN]}>
            <MedicalDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index            element={<MedicalDashboard />} />
        <Route path="dashboard" element={<MedicalDashboard />} />
        <Route path="catalog"   element={<Catalog />} />
        <Route path="orders"    element={<Orders />} />
        <Route path="settings"  element={<MedicalSettings />} />
      </Route>

      {/* Marketing */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
