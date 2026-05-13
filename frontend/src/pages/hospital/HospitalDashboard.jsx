import { motion } from 'framer-motion';
import { useAuth } from '../../auth/useAuth.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import {
  appointmentsStatusBreakdown,
  getActivity,
  getAdmissions7d,
  getAppointments,
  getDoctors,
  getInventoryFromBackend,
  getNotifications,
  getPatients,
  getStaff,
} from '../../services/hospital.js';
import StatCard from '../../components/widgets/StatCard.jsx';
import ActivityFeed from '../../components/widgets/ActivityFeed.jsx';
import NotificationPanel from '../../components/widgets/NotificationPanel.jsx';
import AdmissionsChart from '../../components/widgets/AdmissionsChart.jsx';
import AppointmentStatusChart from '../../components/widgets/AppointmentStatusChart.jsx';
import AppointmentList from '../../components/widgets/AppointmentList.jsx';
import QuickActions from '../../components/widgets/QuickActions.jsx';

const QUICK_ACTIONS = [
  { label: 'New patient',     hint: 'Register an admission', to: '/hospital/patients',     icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6' },
  { label: 'Add doctor',      hint: 'Onboard a clinician',  to: '/hospital/doctors',      icon: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M19 16v4M21 18h-4' },
  { label: 'Schedule',        hint: 'Book an appointment',  to: '/hospital/appointments', icon: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18' },
  { label: 'Reorder stock',   hint: 'Replenish medicines',  to: '/hospital/inventory',    icon: 'M3 7h18M5 7v13h14V7M9 11h6' },
];

export default function HospitalDashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? 'admin';

  const doctors       = useAsyncData(() => getDoctors());
  const staff         = useAsyncData(() => getStaff());
  const patients      = useAsyncData(() => getPatients());
  const inventory     = useAsyncData(({ signal }) => getInventoryFromBackend({ signal }));
  const appointments  = useAsyncData(() => getAppointments());
  const activity      = useAsyncData(() => getActivity());
  const notifications = useAsyncData(() => getNotifications());
  const admissions    = useAsyncData(() => getAdmissions7d());

  const totalDoctors  = doctors.data?.length ?? 0;
  const activeStaff   = staff.data?.filter((s) => s.status === 'active').length ?? 0;
  const totalPatients = patients.data?.length ?? 0;
  const lowStock      = (inventory.data ?? []).filter((p) => (p.quantity ?? 0) < 50).length;
  const todaysAppts   = appointments.data?.length ?? 0;
  const pendingReqs   = (patients.data ?? []).filter((p) => p.admittedAt >= '2026-05-12').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Hospital Console
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-[34px]">
          Good morning, {name}
        </h1>
        <p className="mt-2 text-ink-600">
          A snapshot across departments, with what needs your eye highlighted.
        </p>
      </header>

      <section aria-label="KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total doctors" value={totalDoctors} delta="+2" deltaTone="good" tone="brand"
          loading={doctors.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" /></svg>}
        />
        <StatCard
          label="Total patients" value={totalPatients} delta="+8" deltaTone="good" tone="ocean"
          loading={patients.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>}
        />
        <StatCard
          label="Active staff" value={activeStaff} delta={`${staff.data ? staff.data.length - activeStaff : 0} on leave`} deltaTone="flat" tone="amber"
          loading={staff.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87" /></svg>}
        />
        <StatCard
          label="Pending requests" value={pendingReqs} delta="Today" deltaTone="flat" tone="rose"
          loading={patients.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 8v4l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" /></svg>}
        />
        <StatCard
          label="Stock alerts" value={lowStock} delta="Items < 50" deltaTone={lowStock > 0 ? 'bad' : 'good'} tone="slate"
          loading={inventory.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}
        />
        <StatCard
          label="Today’s appts." value={todaysAppts} delta="6 scheduled" deltaTone="flat" tone="brand"
          loading={appointments.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" /></svg>}
        />
      </section>

      <QuickActions actions={QUICK_ACTIONS} />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {admissions.data && <AdmissionsChart data={admissions.data} />}
        </div>
        {appointments.data && (
          <AppointmentStatusChart data={appointmentsStatusBreakdown(appointments.data)} />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          {appointments.data && <AppointmentList appointments={appointments.data} />}
          <ActivityFeed items={activity.data ?? []} loading={activity.loading} />
        </div>
        {notifications.data && <NotificationPanel items={notifications.data} />}
      </section>
    </motion.div>
  );
}
