import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../ui/Input.jsx';
import PasswordInput from '../ui/PasswordInput.jsx';
import Spinner from '../ui/Spinner.jsx';
import Button from '../ui/Button.jsx';
import { signIn } from '../../services/auth.js';
import { useAuth } from '../../auth/useAuth.js';
import { ROLE_HOME } from '../../auth/roles.js';
import { email as emailValidator, required, runValidators } from '../../utils/validators.js';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [values, setValues] = useState({
    email: location.state?.email ?? '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {
      email: runValidators(values.email, required('Email'), emailValidator),
      password: runValidators(values.password, required('Password')),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      const session = await signIn(values);
      auth.signIn(session);

      const home = ROLE_HOME[session.role];
      if (import.meta.env.DEV) {
        console.info('[auth] signed in', {
          backendRole: session.user?.backendRole,
          frontendRole: session.role,
          redirectTo: home,
        });
      }
      if (!home) {
        toast.error('Your account has no console assigned. Contact your administrator.');
        auth.signOut();
        return;
      }

      toast.success('Welcome back');
      const redirectTo = location.state?.from ?? home;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[auth] sign-in failed', err);
      if (err.type === 'api' && err.status === 401) {
        toast.error('Invalid email or password');
      } else if (err.type === 'api' && err.status === 403) {
        toast.error(err.message ?? 'Your account is awaiting approval');
      } else if (err.type === 'network') {
        toast.error(err.message);
      } else {
        toast.error(err.message ?? 'Could not sign you in');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {location.state?.justRegistered && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"
        >
          Account created. Sign in once an existing admin approves your account.
        </motion.div>
      )}

      <motion.form
        noValidate
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        <Input
          label="Work email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
          autoComplete="email"
          error={errors.email}
        />
        <PasswordInput
          label="Password"
          value={values.password}
          onChange={(e) => setValues((p) => ({ ...p, password: e.target.value }))}
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" />
              Signing in…
            </>
          ) : (
            'Sign in to console'
          )}
        </Button>

        <p className="text-center text-sm text-ink-600">
          New to Deopuri?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </motion.form>
    </>
  );
}
