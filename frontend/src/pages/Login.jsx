import EnterpriseAuthLayout from '../layouts/EnterpriseAuthLayout.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import { useLocation } from 'react-router-dom';
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
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [doctorUserId, setDoctorUserId] = useState(null);
  const [inviteToken, setInviteToken] = useState(null);
  const urlToken = searchParams.get("token");


  useEffect(() => {
    if (location.state?.justRegistered) {
      toast.success('Account created successfully. Please wait for admin approval.');
    }
  }, [location.state]);

  // Email "Create Password" link path: /login?userId=X&token=Y opens the create-password form
  // pre-filled with the invitation token. (Normal login + first-time login are handled by LoginForm.)
  useEffect(() => {
    if (userId) {
      setDoctorUserId(Number(userId));
      setInviteToken(urlToken);
      setShowCreatePassword(true);
    }
  }, [userId, urlToken]);

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
        token={inviteToken}
        onSuccess={() => {
          setShowCreatePassword(false);
          toast.success("Password created successfully. Please login.");
        }}
      />
    ) : (
      <LoginForm
        onFirstTimeLogin={(uid, token) => {
          setDoctorUserId(uid);
          setInviteToken(token);
          setShowCreatePassword(true);
        }}
      />
    )}
  </EnterpriseAuthLayout>
);
}