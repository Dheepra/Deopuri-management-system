import { useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getDoctors } from '../../services/hospital.js';


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

const handleDoctorSubmit = async (e) => {
  e.preventDefault();

  if (!doctorForm.qualification || !doctorForm.specialization) {
    alert("Please select Qualification and Specialization");
    return;
  }

  if (doctorForm.mobileNo.length !== 10) {
    alert("Mobile number must be exactly 10 digits");
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 overflow-y-auto">
  <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-8 shadow-xl">

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Register Doctor
        </h2>

        <button
  type="button"
  onClick={() => setShowDoctorModal(false)}
  className="text-xl"
>
          ✕
        </button>
      </div>

      <form
        onSubmit={handleDoctorSubmit}
        className="grid grid-cols-2 gap-4"
      >
        <input
          className="rounded border p-2"
          placeholder="First Name"
          value={doctorForm.firstName}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              firstName: e.target.value,
            })
          }
        />

        <input
          className="rounded border p-2"
          placeholder="Last Name"
          value={doctorForm.lastName}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              lastName: e.target.value,
            })
          }
        />

        <input
          className="rounded border p-2"
          placeholder="Email"
          value={doctorForm.email}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              email: e.target.value,
            })
          }
        />

       <input
  type="text"
  className="rounded border p-2"
  placeholder="Mobile No"
  value={doctorForm.mobileNo}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setDoctorForm({
        ...doctorForm,
        mobileNo: value,
      });
    }
  }}
/>

        <select
  className="rounded border p-2"
  value={doctorForm.qualification}
  onChange={(e) =>
    setDoctorForm({ ...doctorForm, qualification: e.target.value })
  }
  required
>
  <option value="">Select Qualification</option>

  {QUALIFICATIONS.map((q) => (
    <option key={q} value={q}>
      {q}
    </option>
  ))}
</select>
<select
  className="rounded border p-2"
  value={doctorForm.specialization}
  onChange={(e) =>
    setDoctorForm({ ...doctorForm, specialization: e.target.value })
  }
  required
>
  <option value="">Select Specialization</option>

  {SPECIALIZATIONS.map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
</select>

        <input
         type="number"
          className="rounded border p-2"
          placeholder="Experience Years"
          value={doctorForm.experienceYears}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              experienceYears: e.target.value,
            })
          }
        />

        <input
          className="rounded border p-2"
          placeholder="Address"
          value={doctorForm.address}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              address: e.target.value,
            })
          }
        />

        <div className="col-span-2 mt-2 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => setShowDoctorModal(false)}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
  {loading ? "Registering..." : "Register Doctor"}
</Button>
        </div>
      </form>
    </div>
  </div>
)}
    </section>
  );
}
