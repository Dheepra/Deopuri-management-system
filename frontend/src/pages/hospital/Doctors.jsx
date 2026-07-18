import { useMemo, useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
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

// A soft gradient per doctor avatar so the grid feels lively but stays on-brand.
const AVATAR_GRADIENTS = [
  "from-brand-500 to-brand-700",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
];

const statusMeta = (s) => {
  const k = (s || "").toLowerCase();
  if (k === "active") return { label: "Active", emoji: "🟢", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (k === "on-leave" || k === "on leave") return { label: "On leave", emoji: "🌴", pill: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (k === "inactive") return { label: "Inactive", emoji: "⚪", pill: "bg-ink-100 text-ink-500 ring-ink-200" };
  return { label: s || "Active", emoji: "🩺", pill: "bg-sky-50 text-sky-700 ring-sky-200" };
};

function StatusPill({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}

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

  const doctors = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) => {
      const name = (d?.name || `${d?.firstName || ''} ${d?.lastName || ''}`).toLowerCase();
      return name.includes(q) || (d?.specialization || '').toLowerCase().includes(q);
    });
  }, [data, search]);

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
        `http://localhost:8080/deopuri/hospital-admin/doctors?hospitalAdminId=${hospitalAdminId}`,
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

      if (refetch) refetch();

    } catch (error) {
      console.error(error);
      alert('Failed to register doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            🏥 Our Doctors
          </p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            👨‍⚕️ Doctors
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700">
              {(data ?? []).length}
            </span>
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Meet our clinicians — specialties, experience &amp; availability.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or specialty"
            className="sm:w-72"
          />
          <Button size="md" onClick={() => setShowDoctorModal(true)}>
            ➕ Add doctor
          </Button>
        </div>
      </header>

      {/* Doctor cards */}
      {dataLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🩺</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No doctors yet</p>
          <p className="text-xs text-ink-400">Add your first clinician to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d, i) => {
            const fullName = d?.name || `${d?.firstName || ''} ${d?.lastName || ''}`.trim() || 'Unknown Doctor';
            const initial = fullName.charAt(0).toUpperCase() || 'D';
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            return (
              <div
                key={d?.id ?? i}
                style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
                className="group animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-lg font-bold text-white transition-transform group-hover:scale-110`}>
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">Dr. {fullName}</p>
                    <p className="truncate text-xs text-ink-500">🩺 {d?.specialization || '—'}</p>
                  </div>
                  <StatusPill status={d?.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-ink-50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">🎓 Qualification</p>
                    <p className="truncate text-xs font-bold text-ink-800">{d?.qualification || '—'}</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">⏳ Experience</p>
                    <p className="text-xs font-bold text-ink-800">{d?.experienceYears != null ? `${d.experienceYears} yrs` : '—'}</p>
                  </div>
                  <div className="rounded-xl bg-brand-50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-brand-600">🧑‍🤝‍🧑 Today</p>
                    <p className="text-xs font-bold text-brand-700">{d?.patientsToday ?? 0} patients</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">📅 Joined</p>
                    <p className="truncate text-xs font-bold text-ink-800">{d?.joinedAt || '—'}</p>
                  </div>
                </div>

                {(d?.email || d?.mobileNo) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink-50 pt-3 text-[11px] text-ink-500">
                    {d?.email && <span className="truncate">📧 {d.email}</span>}
                    {d?.mobileNo && <span>📱 {d.mobileNo}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="animate-pop flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

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
                  className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
                >{loading ? 'Creating…' : '✅ Create doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
