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
import Product from "../pages/admin/Products.jsx";
import AdminOrders from "../pages/admin/AdminOrders.jsx";
import Payments from "../pages/admin/Payments.jsx";
import PaymentDetails from "../pages/admin/PaymentDetails.jsx";
import Offers from "../pages/admin/Offers.jsx";
import TopCustomers from "../pages/admin/TopCustomers.jsx";
import RawMaterial from "../pages/admin/RawMaterial.jsx";
import Expenses from "../pages/admin/Expenses.jsx";
import ProfitLoss from "../pages/admin/ProfitLoss.jsx";

import HospitalDashboardLayout from '../layouts/HospitalDashboardLayout.jsx';
import HospitalDashboard from '../pages/hospital/HospitalDashboard.jsx';
import Doctors from '../pages/hospital/Doctors.jsx';
import Orders from '../pages/hospital/Orders.jsx';
import HospitalMyOffers from "../pages/hospital/MyOffers.jsx";
import Staff from '../pages/hospital/Staff.jsx';
import Patients from '../pages/hospital/Patients.jsx';
import Inventory from '../pages/hospital/Inventory.jsx';
import Appointments from '../pages/hospital/Appointments.jsx';
import Reports from '../pages/hospital/Reports.jsx';
import HospitalSettings from '../pages/hospital/Settings.jsx';

import DoctorDashboardLayout from '../layouts/DoctorDashboardLayout.jsx';
import DoctorDashboard from '../pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from '../pages/doctor/DoctorAppointments.jsx';
import MyPatients from '../pages/doctor/MyPatients.jsx';
import Prescriptions from '../pages/doctor/Prescriptions.jsx';
import DoctorReports from '../pages/doctor/Reports.jsx';
import Profile from '../pages/doctor/Profile.jsx';

import MedicalDashboardLayout from '../layouts/MedicalDashboardLayout.jsx';
import MedicalDashboard from '../pages/medical/MedicalDashboard.jsx';
import Catalog from '../pages/medical/Catalog.jsx';
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
<Route path="raw-material" element={<RawMaterial />} />
<Route
  path="expenses"
  element={<Expenses />}
/>
<Route
   path="profit-loss"
   element={<ProfitLoss />}
/>
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
        <Route
  path="my-offers"
  element={<MedicalMyOffers />}
/>
        <Route path="settings"  element={<MedicalSettings />} />
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
          <Route path="profile" element={<Profile />} />
        </Route>

      {/* Marketing */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>

    
  );
}
