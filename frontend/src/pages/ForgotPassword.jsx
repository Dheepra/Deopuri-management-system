import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EnterpriseAuthLayout from '../layouts/EnterpriseAuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import { forgotPassword, resetPassword } from '../services/auth.js';
import {
  email as emailValidator,
  matches,
  minLength,
  required,
  runValidators,
} from '../utils/validators.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' → 'otp'
  const [email, setEmail] = useState('');
  const [values, setValues] = useState({ otp: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Step 1 — verify email exists in DB & send OTP.
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const err = runValidators(email, required('Email'), emailValidator);
    if (err) {
      setErrors({ email: err });
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (error) {
      // 404 "User does not exist" (or any other) — show the backend message.
      toast.error(error?.message || 'Could not send OTP');
      setErrors({ email: error?.message || 'User does not exist' });
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — verify OTP + set the new password.
  const handleReset = async (e) => {
    e.preventDefault();
    const next = {
      otp: runValidators(values.otp, required('OTP'), minLength(6)),
      password: runValidators(values.password, required('Password'), minLength(6)),
      confirm:
        runValidators(values.confirm, required('Confirm password')) ||
        matches(values.password, 'Passwords')(values.confirm),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await resetPassword(email.trim(), values.otp.trim(), values.password);
      toast.success('Password reset. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseAuthLayout
      title="Reset password"
      subtitle={
        step === 'email'
          ? "Enter your work email — we'll send a one-time password (OTP)."
          : `Enter the OTP sent to ${email} and choose a new password.`
      }
      formEyebrow="Forgot password"
      tagline="Secure access for every admin."
    >
      {step === 'email' ? (
        <form onSubmit={handleSendOtp} noValidate className="space-y-4">
          <Input
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            autoComplete="email"
            error={errors.email}
          />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send OTP'}
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            <span aria-hidden="true">←</span>
            Back to sign in
          </Link>
        </form>
      ) : (
        <form onSubmit={handleReset} noValidate className="space-y-4">
          <Input
            label="OTP"
            inputMode="numeric"
            maxLength={6}
            value={values.otp}
            onChange={(e) => setField('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={errors.otp}
          />
          <PasswordInput
            label="New password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            autoComplete="new-password"
            error={errors.password}
          />
          <PasswordInput
            label="Confirm password"
            value={values.confirm}
            onChange={(e) => setField('confirm', e.target.value)}
            autoComplete="new-password"
            error={errors.confirm}
          />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Resetting…' : 'Reset password'}
          </Button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setErrors({});
              }}
              className="text-sm font-semibold text-ink-600 hover:text-brand-700"
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={submitting}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-60"
            >
              Resend OTP
            </button>
          </div>
        </form>
      )}
    </EnterpriseAuthLayout>
  );
}
