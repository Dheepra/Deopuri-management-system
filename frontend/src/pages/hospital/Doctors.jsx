import { useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getDoctors } from '../../services/hospital.js';

const STATUS_TONE = { active: 'success', 'on-leave': 'warning', inactive: 'neutral' };

const COLUMNS = [
  {
    key: 'name',
    header: 'Doctor',
    render: (row) => (
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
          {row.name.split(' ').slice(-1)[0][0]}
        </span>
        <div>
          <p className="font-medium text-ink-900">{row.name}</p>
          <p className="text-xs text-ink-500">{row.id}</p>
        </div>
      </div>
    ),
  },
  { key: 'specialty', header: 'Specialty' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
  },
  {
    key: 'patientsToday',
    header: "Today's patients",
    align: 'right',
    render: (row) => <span className="font-semibold text-ink-900">{row.patientsToday}</span>,
  },
  { key: 'joinedAt', header: 'Joined' },
];

export default function Doctors() {
  const { data, loading } = useAsyncData(() => getDoctors());
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

  try {
    const session = JSON.parse(
      localStorage.getItem('auth.session')
    );

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
      throw new Error('Failed');
    }

    alert('Doctor registered successfully. Invitation email sent.');

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

  } catch (error) {
    console.error(error);
    alert('Failed to register doctor');
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

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
          className="rounded border p-2"
          placeholder="Mobile No"
          value={doctorForm.mobileNo}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              mobileNo: e.target.value,
            })
          }
        />

        <input
          className="rounded border p-2"
          placeholder="Qualification"
          value={doctorForm.qualification}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              qualification: e.target.value,
            })
          }
        />

        <input
          className="rounded border p-2"
          placeholder="Specialization"
          value={doctorForm.specialization}
          onChange={(e) =>
            setDoctorForm({
              ...doctorForm,
              specialization: e.target.value,
            })
          }
        />

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

          <Button type="submit">
            Register Doctor
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
    </section>
  );
}
