import EnterpriseAuthLayout from '../layouts/EnterpriseAuthLayout.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import CreatePassword from './CreatePassword';

const BULLETS = [
  {
    label: 'One login, three consoles',
    hint: 'You land on the right dashboard for your role automatically.',
    icon: 'M5 12h14M13 5l7 7-7 7',
  },
  {
    label: 'Real-time inventory',
    hint: 'Variant-level stock and expiry, synced instantly.',
    icon: 'M3 7h18M5 7v13h14V7M9 11h6',
  },
  {
    label: 'Designed for clarity',
    hint: 'A calm interface your team will actually enjoy.',
    icon: 'M3 12h18M12 3v18',
  },
];

export default function Login() {

  const [searchParams] = useSearchParams();

const userId = searchParams.get("userId");
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreatePassword, setShowCreatePassword] = useState(false);
const [doctorUserId, setDoctorUserId] = useState(null);


  useEffect(() => {
    if (location.state?.justRegistered) {
      toast.success('Account created successfully. Please wait for admin approval.');
    }
  }, [location.state]);

  // 🔥 LOGIN HANDLER (NOW CORRECT)
  const handleLoginSuccess = (res) => {

    // 👇 FIRST TIME LOGIN (DOCTOR ONLY)
    if (session.status === "FIRST_TIME_LOGIN") {
  navigate("/create-password", {
    state: { userId: session.id }
  });
  return;
}
useEffect(() => {
  if (userId) {
    setDoctorUserId(Number(userId));
    setShowCreatePassword(true);
  }
}, [userId]);

    // 👇 NORMAL LOGIN SUCCESS
    if (res.token) {

      localStorage.setItem("token", res.token);

      if (res.role === "DOCTOR") {
        navigate("/doctor/dashboard");
      } else if (res.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
  <EnterpriseAuthLayout
    title="Welcome back"
    subtitle="Sign in to your admin console. You will be redirected based on your role."
    formEyebrow="Sign in"
    tagline="One quiet dashboard. Built for your role."
    bullets={BULLETS}
  >
    {showCreatePassword ? (
      <CreatePassword
        userId={doctorUserId}
        onSuccess={() => {
          setShowCreatePassword(false);
          toast.success("Password created successfully. Please login.");
        }}
      />
    ) : (
      <LoginForm
        onFirstTimeLogin={(userId) => {
          setDoctorUserId(userId);
          setShowCreatePassword(true);
        }}
      />
    )}
  </EnterpriseAuthLayout>
);
}