import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Home from '../pages/Home.jsx';


import NotFound from '../pages/NotFound.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';

import Signup from '../pages/Signup.jsx';
import Login from '../pages/Login.jsx';

import CompanyDashboard from '../pages/admin/Dashboard.jsx';
import CompanyDashboardLayout from '../layouts/CompanyDashboardLayout.jsx';
import Product from "../pages/admin/Products.jsx";
import AdminOrders from "../pages/admin/AdminOrders.jsx";
import Payments from "../pages/admin/Payments.jsx";
import PaymentDetails from "../pages/admin/PaymentDetails.jsx";
import Offers from "../pages/admin/Offers.jsx";
import TopCustomers from "../pages/admin/TopCustomers.jsx";
import ExpensesMaterials from "../pages/admin/ExpensesMaterials.jsx";
import ProfitLoss from "../pages/admin/ProfitLoss.jsx";
import Settings from "../pages/admin/Settings.jsx";

import HospitalDashboardLayout from '../layouts/HospitalDashboardLayout.jsx';
import HospitalDashboard from '../pages/hospital/HospitalDashboard.jsx';
import Doctors from '../pages/hospital/Doctors.jsx';
import Orders from '../pages/hospital/Orders.jsx';
import HospitalMyOffers from "../pages/hospital/MyOffers.jsx";
import Staff from '../pages/hospital/Staff.jsx';
import Patients from '../pages/hospital/Patients.jsx';
import HospitalLeaves from '../pages/hospital/Leaves.jsx';
import Appointments from '../pages/hospital/Appointments.jsx';
import HospitalSettings from '../pages/hospital/Settings.jsx';

import DoctorDashboardLayout from '../layouts/DoctorDashboardLayout.jsx';
import DoctorDashboard from '../pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from '../pages/doctor/DoctorAppointments.jsx';
import MyPatients from '../pages/doctor/MyPatients.jsx';
import Prescriptions from '../pages/doctor/Prescriptions.jsx';
import DoctorReports from '../pages/doctor/Reports.jsx';
import DoctorLeaves from '../pages/doctor/DoctorLeaves.jsx';
import Profile from '../pages/doctor/Profile.jsx';

import StaffDashboardLayout from '../layouts/StaffDashboardLayout.jsx';
import StaffDashboard from '../pages/staff/StaffDashboard.jsx';
import StaffAttendance from '../pages/staff/StaffAttendance.jsx';
import StaffLeaves from '../pages/staff/StaffLeaves.jsx';
import StaffSettings from '../pages/staff/StaffSettings.jsx';

import MedicalDashboardLayout from '../layouts/MedicalDashboardLayout.jsx';
import MedicalDashboard from '../pages/medical/MedicalDashboard.jsx';
import Catalog from '../pages/medical/Catalog.jsx';
import MedicalInventory from '../pages/medical/Inventory.jsx';
import MedicalSales from '../pages/medical/Sales.jsx';
import MedicalBilling from '../pages/medical/Billing.jsx';
import MedicalKhata from '../pages/medical/Khata.jsx';
import MedicalExpenses from '../pages/medical/MedicalExpenses.jsx';
import MedicalProfitLoss from '../pages/medical/MedicalProfitLoss.jsx';
import MedicalDayClose from '../pages/medical/DayClose.jsx';
import MedicalMyOffers from "../pages/medical/MyOffers.jsx";

import MedicalSettings from '../pages/medical/Settings.jsx';
import CreatePassword from '../pages/CreatePassword.jsx';

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
      <Route path="/create-password" element={<CreatePassword />} />
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
          <Route path="products" element={<Product />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payments/:orderNumber" element={<PaymentDetails />} />
          <Route
  path="offers"
  element={<Offers />}
/>
<Route
  path="top-customers"
  element={<TopCustomers />}
/>
<Route path="expenses" element={<ExpensesMaterials />} />
<Route path="raw-material" element={<ExpensesMaterials />} />
<Route
   path="profit-loss"
   element={<ProfitLoss />}
/>
<Route path="settings" element={<Settings />} />
        {/* Unknown /admin/* → stay in this dashboard (no marketing/403, no perceived logout). */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
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
        <Route path="orders"       element={<Orders />} />
        <Route
  path="my-offers"
  element={<HospitalMyOffers />}
/>
        <Route path="doctors"      element={<Doctors />} />
        <Route path="staff"        element={<Staff />} />
        <Route path="leaves"       element={<HospitalLeaves />} />
        <Route path="patients"     element={<Patients />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="settings"     element={<HospitalSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
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
        <Route path="inventory"  element={<MedicalInventory />} />
        <Route path="billing"    element={<MedicalBilling />} />
        <Route path="khata"      element={<MedicalKhata />} />
        <Route path="sales"      element={<MedicalSales />} />
        <Route path="expenses"   element={<MedicalExpenses />} />
        <Route path="profit-loss" element={<MedicalProfitLoss />} />
        <Route path="day-close" element={<MedicalDayClose />} />
        <Route path="staff"     element={<Staff />} />
        <Route path="leaves"    element={<HospitalLeaves />} />
        <Route path="orders"    element={<Orders />} />
        <Route
  path="my-offers"
  element={<MedicalMyOffers />}
/>
        <Route path="settings"  element={<MedicalSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* DOCTOR */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute roles={[ROLES.DOCTOR]}>
              <DoctorDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
           <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<MyPatients />} />
          
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="reports" element={<DoctorReports />} />
          <Route path="leaves" element={<DoctorLeaves />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

      {/* STAFF */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={[ROLES.STAFF]}>
            <StaffDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index             element={<StaffDashboard />} />
        <Route path="dashboard"  element={<StaffDashboard />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leaves"     element={<StaffLeaves />} />
        <Route path="settings"   element={<StaffSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Marketing */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>

    
  );
}
