import { useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getDoctors } from '../../services/hospital.js';
import {
  email as emailValidator,
  phone10,
  required,
  runValidators,
} from '../../utils/validators.js';

function validateDoctor(values) {
  const experienceError = runValidators(values.experienceYears, required('Experience'));
  const experienceInvalid =
    !experienceError &&
    (Number.isNaN(Number(values.experienceYears)) || Number(values.experienceYears) < 0)
      ? 'Enter a valid number of years (0 or more)'
      : null;

  return {
    firstName: runValidators(values.firstName, required('First name')),
    lastName: runValidators(values.lastName, required('Last name')),
    email: runValidators(values.email, required('Email'), emailValidator),
    mobileNo: runValidators(values.mobileNo, required('Mobile number'), phone10),
    qualification: runValidators(values.qualification, required('Qualification')),
    specialization: runValidators(values.specialization, required('Specialization')),
    experienceYears: experienceError || experienceInvalid,
    address: runValidators(values.address, required('Address')),
  };
}


const STATUS_TONE = { active: 'success', 'on-leave': 'warning', inactive: 'neutral' };
const QUALIFICATIONS = [
  "MBBS","BDS","BAMS","BHMS","BUMS","MD","MS","DM","MCh","DNB",
  "MDS","BPT","MPT","PharmD","DGO","DCH","DA",
  "Diploma in Orthopedics","Diploma in Cardiology","Fellowship"
];

const SPECIALIZATIONS = [
  "General Physician","General Medicine","Internal Medicine","Pediatrics",
  "Gynecology","Obstetrics","Orthopedics","Cardiology","Neurology",
  "Neurosurgery","Dermatology","ENT","Ophthalmology","Psychiatry",
  "Pulmonology","Gastroenterology","Nephrology","Urology","Oncology",
  "Endocrinology","Rheumatology","Anesthesiology","Radiology","Pathology",
  "Emergency Medicine","Family Medicine","Dentistry","Physiotherapy","Surgery"
];
const COLUMNS = [
  {
    key: 'name',
    header: 'Doctor',
    render: (row) => {
      const fullName =
        row?.name ||
        `${row?.firstName || ''} ${row?.lastName || ''}`.trim();

      return (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {fullName?.charAt(0) || 'D'}
          </div>

          <div>{fullName || 'Unknown Doctor'}</div>
          <div>{row?.id || '-'}</div>
        </div>
      );
    },
  },

  { key: 'specialization', header: 'Specialty' },

  {
    key: 'status',
    header: 'Status',
    render: (row) => row?.status,
  },

  {
    key: 'patientsToday',
    header: "Today's patients",
    align: 'right',
    render: (row) => row?.patientsToday,
  },

  { key: 'joinedAt', header: 'Joined' },
];

export default function Doctors() {
  const [loading, setLoading] = useState(false);

  const { data, loading: dataLoading, refetch } = useAsyncData(() => getDoctors());

  const [search, setSearch] = useState('');
  const [showDoctorModal, setShowDoctorModal] = useState(false);

const [doctorForm, setDoctorForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  mobileNo: '',
  qualification: '',
  specialization: '',
  experienceYears: '',
  address: '',
});
const [doctorErrors, setDoctorErrors] = useState({});

const setDoctorField = (name, value) => {
  setDoctorForm((prev) => ({ ...prev, [name]: value }));
  if (doctorErrors[name]) {
    setDoctorErrors((prev) => ({ ...prev, [name]: undefined }));
  }
};

const handleDoctorSubmit = async (e) => {
  e.preventDefault();

  const nextErrors = validateDoctor(doctorForm);
  setDoctorErrors(nextErrors);

  if (Object.values(nextErrors).some(Boolean)) {
    return;
  }

  setLoading(true);

  try {
    const session = JSON.parse(localStorage.getItem('auth.session'));

    const hospitalAdminId = session.user.id;

    const response = await fetch(
      `http://localhost:8080/api/hospital-admin/doctors?hospitalAdminId=${hospitalAdminId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(doctorForm),
      }
    );

    if (!response.ok) {
  const errorText = await response.text();
  console.log("Backend Error:", errorText);
  throw new Error(errorText || 'Failed');
}

    alert('Doctor registered successfully');

    setShowDoctorModal(false);

    setDoctorForm({
      firstName: '',
      lastName: '',
      email: '',
      mobileNo: '',
      qualification: '',
      specialization: '',
      experienceYears: '',
      address: '',
    });
    setDoctorErrors({});

    if (refetch) refetch(); // better version

  } catch (error) {
    console.error(error);
    alert('Failed to register doctor');
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Doctors
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Doctors management
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Manage clinicians, specialties, and shift availability.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or specialty"
            className="sm:w-72"
          />
          <Button
  size="md"
  onClick={() => setShowDoctorModal(true)}
>
   + Add doctor
</Button>
        </div>
      </header>

      <Table
        columns={COLUMNS}
        rows={data ?? []}
        search={search}
        loading={loading}
        pageSize={8}
        empty={{
          title: 'No doctors yet',
          description: 'Start onboarding doctors to populate this list.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />
            </svg>
          ),
        }}
        actions={(row) => (
          <button
            type="button"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            onClick={() => {}}
          >
            View
          </button>
        )}
      />

      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">👨‍⚕️</span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink-900">Register doctor</h3>
                <p className="truncate text-xs text-ink-500">Onboard a new clinician to your hospital</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >✕</button>
            </div>

            <form onSubmit={handleDoctorSubmit} className="flex min-h-0 flex-1 flex-col">
              {/* Body (scrolls) */}
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-ink-700">🧑 First name</span>
                    <input
                      className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="e.g. Aditi"
                      value={doctorForm.firstName}
                      onChange={(e) => setDoctorField('firstName', e.target.value)}
                    />
                    {doctorErrors.firstName && (
                      <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.firstName}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-ink-700">🧑 Last name</span>
                    <input
                      className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="e.g. Sharma"
                      value={doctorForm.lastName}
                      onChange={(e) => setDoctorField('lastName', e.target.value)}
                    />
                    {doctorErrors.lastName && (
                      <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.lastName}</p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">📧 Email</span>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="doctor@hospital.com"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorField('email', e.target.value)}
                  />
                  {doctorErrors.email && (
                    <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.email}</p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">📱 Mobile</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="10-digit mobile number"
                    value={doctorForm.mobileNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setDoctorField('mobileNo', value);
                    }}
                  />
                  {doctorErrors.mobileNo && (
                    <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.mobileNo}</p>
                  )}
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-ink-700">🎓 Qualification</span>
                    <select
                      className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      value={doctorForm.qualification}
                      onChange={(e) => setDoctorField('qualification', e.target.value)}
                    >
                      <option value="">Select qualification</option>
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    {doctorErrors.qualification && (
                      <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.qualification}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-ink-700">🩺 Specialization</span>
                    <select
                      className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      value={doctorForm.specialization}
                      onChange={(e) => setDoctorField('specialization', e.target.value)}
                    >
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {doctorErrors.specialization && (
                      <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.specialization}</p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">⏳ Experience (years)</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="e.g. 5"
                    value={doctorForm.experienceYears}
                    onChange={(e) => setDoctorField('experienceYears', e.target.value)}
                  />
                  {doctorErrors.experienceYears && (
                    <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.experienceYears}</p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏠 Address</span>
                  <input
                    className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="Street, city, state"
                    value={doctorForm.address}
                    onChange={(e) => setDoctorField('address', e.target.value)}
                  />
                  {doctorErrors.address && (
                    <p className="mt-1 text-xs font-medium text-red-500">{doctorErrors.address}</p>
                  )}
                </label>
              </div>

              {/* Footer (sticky) */}
              <div className="flex gap-3 border-t border-ink-100 px-5 py-4 pb-safe">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
                >✖ Cancel</button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
                >{loading ? 'Creating…' : '✅ Create doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
