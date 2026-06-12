import { useMemo, useState, useEffect } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getAppointments } from '../../services/hospital.js';
import axios from 'axios';
/* ================= STATUS COLORS ================= */
const STATUS_TONE = {
  BOOKED: 'info',
  CONFIRMED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

/* ================= FILTER OPTIONS ================= */
const FILTERS = ['All', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];


/* ================= MAIN COMPONENT ================= */
export default function Appointments() {
  
const session = JSON.parse(
  localStorage.getItem('auth.session') || '{}'
);

console.log("SESSION =", session);

const adminId = session?.userId;

console.log("ADMIN ID =", adminId);

  const { data, loading, refresh } =
    useAsyncData(() => getAppointments(adminId));

  const handleConfirm = async (appointmentId) => {
      console.log("CLICKED ID =", appointmentId);
    try {
      await axios.patch(
        `http://localhost:8080/api/appointments/${appointmentId}/status?status=CONFIRMED`
      );
         console.log("SUCCESS =", response.data);

console.log(response);
      refresh();
    } catch (error) {
      console.error('Confirm failed', error);
    }
  };

  

const columns = [
  {
    key: 'appointmentTime',
    header: 'Time',
  },
  {
    key: 'appointmentDate',
    header: 'Date',
  },
  {
    key: 'patientName',
    header: 'Patient',
  },
  {
    key: 'doctorName',
    header: 'Doctor',
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge tone={STATUS_TONE[row.status] || 'info'}>
        {row.status}
      </Badge>
    ),
  },
  {
  key: 'actions',
  header: 'Actions',
 render: (row) =>
  row.status === 'BOOKED' ? (
    <Button
      onClick={() => {
        console.log("ROW =", row);
        handleConfirm(row.id);
      }}
    >
      Confirm
    </Button>
  ) : (
    <span>Confirmed</span>
  )
}
];
  
 useEffect(() => {
  const interval = setInterval(refresh, 5000);

  return () => clearInterval(interval);
}, []);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  console.log("Appointments Data:", data);
  /* -------- FILTER LOGIC -------- */
  //const filteredRows = useMemo(() => {
  //   const base = data ?? [];

  //   let result =
  //     filter === 'All'
  //       ? base
  //       : base.filter((a) => a.status === filter);

  //   if (search) {
  //     result = result.filter(
  //       (a) =>
  //         a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
  //         a.doctorName?.toLowerCase().includes(search.toLowerCase())
  //     );
  //   }

  //   return result;
  // }, [data, filter, search]);

 const filteredRows = useMemo(() => {
  const base = data ?? [];

  console.log("Current Filter:", filter);
  console.log("Base Data:", base);

  let result =
    filter === 'All'
      ? base
      : base.filter((a) => a.status === filter);

  if (search) {
    result = result.filter(
      (a) =>
        a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorName?.toLowerCase().includes(search.toLowerCase())
    );
  }

  console.log("Result:", result);

  return result;
}, [data, filter, search]);

  return (
    <section className="p-4 space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Appointments
        </h2>

        <Button>
          Book Appointment
        </Button>
      </div>

      {/* SEARCH */}
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patient or doctor..."
      />

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              'rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              filter === f
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
            ].join(' ')}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <Table
  columns={columns}
  rows={filteredRows}
  loading={loading}
  pageSize={8}
/>
    </section>
  );
}