import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../ui/Input.jsx';
import PasswordInput from '../ui/PasswordInput.jsx';
import Spinner from '../ui/Spinner.jsx';
import Button from '../ui/Button.jsx';
import RoleSelector from './RoleSelector.jsx';
import { signUp } from '../../services/auth.js';
import { PUBLIC_SIGNUP_ROLES, ROLES, toBackendRole } from '../../auth/roles.js';
import {
  email as emailValidator,
  matches,
  minLength,
  phone10,
  required,
  runValidators,
} from '../../utils/validators.js';

const ROLE_OPTIONS = [
  {
    value: ROLES.HOSPITAL_ADMIN,
    label: 'Hospital Admin',
    description: 'Manage doctors, staff, patients, and appointments.',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    value: ROLES.MEDICAL_ADMIN,
    label: 'Medical Admin',
    description: 'Run your medical shop’s inventory, sales, and orders.',
    icon: 'M3 7h18M5 7v13h14V7M9 11h6',
  },
].filter((opt) => PUBLIC_SIGNUP_ROLES.includes(opt.value));

const INITIAL = {
  role: null,
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
};

const FIELD_MAP = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  phone: 'mobileNo',
  organization: 'shopName',
  address: 'address',
};
const API_TO_FORM = Object.fromEntries(Object.entries(FIELD_MAP).map(([k, v]) => [v, k]));

function validate(values) {
  return {
    role: values.role ? null : 'Choose the role you want to register as',
    firstName: runValidators(values.firstName, required('First name')),
    lastName: runValidators(values.lastName, required('Last name')),
    organization: runValidators(values.organization, required('Organization name')),
    email: runValidators(values.email, required('Email'), emailValidator),
    password: runValidators(values.password, required('Password'), minLength(8)),
    confirmPassword: runValidators(
      values.confirmPassword,
      required('Confirm password'),
      matches(values.password, 'password'),
    ),
    phone: runValidators(values.phone, required('Phone number'), phone10),
    address: runValidators(values.address, required('Address')),
  };
}

export default function SignupForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const next = validate({ ...values, [name]: value })[name];
      if (!next) setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const onBlur = (name) => {
    const fieldErr = validate(values)[name];
    setErrors((prev) => ({ ...prev, [name]: fieldErr }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSubmitting(true);
    const payload = {
      ...Object.fromEntries(
        Object.entries(values)
          .filter(([k]) => FIELD_MAP[k])
          .map(([k, v]) => [FIELD_MAP[k], typeof v === 'string' ? v.trim() : v]),
      ),
      role: toBackendRole(values.role),
    };
    try {
      await signUp(payload);
      toast.success('Account created. Awaiting approval.');
      navigate('/login', { state: { justRegistered: true, email: values.email } });
    } catch (err) {
      if (err.type === 'api' && err.status === 409) {
        toast.error('That email is already registered');
        setErrors((prev) => ({ ...prev, email: 'Email already in use' }));
      } else if (err.type === 'api' && err.status === 400 && err.fieldErrors?.length) {
        toast.error('Some fields need attention');
        const next = {};
        for (const { field, message } of err.fieldErrors) {
          const key = API_TO_FORM[field];
          if (key) next[key] = message;
        }
        setErrors((prev) => ({ ...prev, ...next }));
      } else if (err.type === 'network') {
        toast.error(err.message);
      } else {
        toast.error(err.message ?? 'Could not create your account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Tailor the organization label to the chosen role.
  const organizationLabel =
    values.role === ROLES.HOSPITAL_ADMIN
      ? 'Hospital name'
      : values.role === ROLES.MEDICAL_ADMIN
        ? 'Shop name'
        : 'Organization name';

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <RoleSelector
        options={ROLE_OPTIONS}
        value={values.role}
        onChange={(v) => setField('role', v)}
        error={errors.role}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          value={values.firstName}
          onChange={(e) => setField('firstName', e.target.value)}
          onBlur={() => onBlur('firstName')}
          autoComplete="given-name"
          error={errors.firstName}
        />
        <Input
          label="Last name"
          value={values.lastName}
          onChange={(e) => setField('lastName', e.target.value)}
          onBlur={() => onBlur('lastName')}
          autoComplete="family-name"
          error={errors.lastName}
        />
      </div>

      <Input
        label={organizationLabel}
        value={values.organization}
        onChange={(e) => setField('organization', e.target.value)}
        onBlur={() => onBlur('organization')}
        autoComplete="organization"
        error={errors.organization}
      />

      <Input
        label="Work email"
        type="email"
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        onBlur={() => onBlur('email')}
        autoComplete="email"
        error={errors.email}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PasswordInput
          label="Password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          onBlur={() => onBlur('password')}
          error={errors.password}
          hint="At least 8 characters"
        />
        <PasswordInput
          label="Confirm password"
          value={values.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          onBlur={() => onBlur('confirmPassword')}
          error={errors.confirmPassword}
        />
      </div>

      <Input
        label="Phone number"
        type="tel"
        inputMode="numeric"
        value={values.phone}
        onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
        onBlur={() => onBlur('phone')}
        autoComplete="tel-national"
        error={errors.phone}
        hint="10-digit mobile, no spaces"
      />

      <Input
        label="Address"
        value={values.address}
        onChange={(e) => setField('address', e.target.value)}
        onBlur={() => onBlur('address')}
        autoComplete="street-address"
        error={errors.address}
      />

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Spinner className="h-4 w-4" />
            Creating account…
          </>
        ) : (
          <>
            Create account
            <span aria-hidden="true">→</span>
          </>
        )}
      </Button>

      <p className="text-center text-sm text-ink-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Sign in
        </Link>
      </p>
    </motion.form>
  );
}
