import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  appointmentsStatusBreakdown,
  getAdmissions7d,
  getAppointments,
} from '../../services/hospital.js';
import AdmissionsChart from '../../components/widgets/AdmissionsChart.jsx';
import AppointmentStatusChart from '../../components/widgets/AppointmentStatusChart.jsx';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DEPARTMENT_LOAD = [
  { department: 'Cardio',     patients: 32 },
  { department: 'Ortho',      patients: 24 },
  { department: 'Peds',       patients: 18 },
  { department: 'Neuro',      patients: 14 },
  { department: 'Derm',       patients: 9 },
  { department: 'Surgery',    patients: 11 },
  { department: 'Oncology',   patients: 6 },
  { department: 'Psych',      patients: 8 },
];

function DeptChart() {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <header className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          Department occupancy
        </h3>
        <p className="text-xs text-ink-500">Patients currently admitted</p>
      </header>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DEPARTMENT_LOAD} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
            <XAxis dataKey="department" stroke="var(--color-ink-400)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-ink-400)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(31,155,110,0.08)' }}
              contentStyle={{ borderRadius: 12, border: '1px solid rgb(238,241,245)', fontSize: 12 }}
            />
            <Bar dataKey="patients" radius={[6, 6, 0, 0]} fill="var(--color-brand-500)" animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function Reports() {
  const admissions = useAsyncData(() => getAdmissions7d());
  const appointments = useAsyncData(() => getAppointments());

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Reports
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          Reports &amp; analytics
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Trends across admissions, appointments, and department load.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {admissions.data && <AdmissionsChart data={admissions.data} />}
        </div>
        {appointments.data && (
          <AppointmentStatusChart data={appointmentsStatusBreakdown(appointments.data)} />
        )}
      </div>

      <DeptChart />
    </section>
  );
}
