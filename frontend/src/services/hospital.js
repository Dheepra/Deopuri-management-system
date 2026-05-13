import { http } from './http.js';

// Real backend calls — inventory uses /api/products from the existing Spring Boot API.
export async function getInventoryFromBackend({ signal } = {}) {
  const { data } = await http.get('/api/products', { signal });
  return data;
}

// Mock data for entities the backend doesn't model yet (doctors, patients,
// appointments). Each function returns a Promise so swapping for a real
// endpoint later is a one-line change.
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const DOCTORS = [
  { id: 'D-101', name: 'Dr. Aanya Sharma',  specialty: 'Cardiology',     status: 'active',    patientsToday: 12, joinedAt: '2022-04-12' },
  { id: 'D-102', name: 'Dr. Rohan Mehta',   specialty: 'Orthopedics',    status: 'active',    patientsToday: 8,  joinedAt: '2021-09-03' },
  { id: 'D-103', name: 'Dr. Priya Iyer',    specialty: 'Pediatrics',     status: 'on-leave',  patientsToday: 0,  joinedAt: '2023-01-22' },
  { id: 'D-104', name: 'Dr. Vihaan Gupta',  specialty: 'Neurology',      status: 'active',    patientsToday: 6,  joinedAt: '2020-11-30' },
  { id: 'D-105', name: 'Dr. Meera Nair',    specialty: 'Dermatology',    status: 'active',    patientsToday: 10, joinedAt: '2024-02-08' },
  { id: 'D-106', name: 'Dr. Arjun Khanna',  specialty: 'General Surgery',status: 'active',    patientsToday: 7,  joinedAt: '2019-07-14' },
  { id: 'D-107', name: 'Dr. Saanvi Joshi',  specialty: 'Oncology',       status: 'active',    patientsToday: 5,  joinedAt: '2022-08-19' },
  { id: 'D-108', name: 'Dr. Kabir Bose',    specialty: 'Radiology',      status: 'inactive',  patientsToday: 0,  joinedAt: '2018-03-11' },
  { id: 'D-109', name: 'Dr. Tara Sethi',    specialty: 'Endocrinology',  status: 'active',    patientsToday: 9,  joinedAt: '2024-09-01' },
  { id: 'D-110', name: 'Dr. Ishaan Verma',  specialty: 'Psychiatry',     status: 'active',    patientsToday: 4,  joinedAt: '2021-05-25' },
];

const STAFF = [
  { id: 'S-201', name: 'Nurse Tara Pillai',     role: 'Senior Nurse',  department: 'ICU',        shift: 'Day',   status: 'active' },
  { id: 'S-202', name: 'Lab Tech Manish Rao',   role: 'Lab Technician',department: 'Pathology',  shift: 'Night', status: 'active' },
  { id: 'S-203', name: 'Nurse Nikhil Das',      role: 'Nurse',         department: 'OPD',        shift: 'Day',   status: 'active' },
  { id: 'S-204', name: 'Pharm. Reena Patil',    role: 'Pharmacist',    department: 'Pharmacy',   shift: 'Day',   status: 'on-leave' },
  { id: 'S-205', name: 'Radiographer Diya Kaul',role: 'Radiographer',  department: 'Radiology',  shift: 'Day',   status: 'active' },
  { id: 'S-206', name: 'Receptionist Aman Lal', role: 'Receptionist',  department: 'Reception',  shift: 'Day',   status: 'active' },
];

const PATIENTS = [
  { id: 'P-3001', name: 'Aarav Singh',    age: 34, gender: 'M', doctor: 'Dr. Aanya Sharma',  admittedAt: '2026-05-12', condition: 'Hypertension'   },
  { id: 'P-3002', name: 'Diya Reddy',     age: 8,  gender: 'F', doctor: 'Dr. Priya Iyer',    admittedAt: '2026-05-13', condition: 'Bronchitis'     },
  { id: 'P-3003', name: 'Kunal Mehta',    age: 52, gender: 'M', doctor: 'Dr. Rohan Mehta',   admittedAt: '2026-05-11', condition: 'Knee replacement'},
  { id: 'P-3004', name: 'Saanvi Joshi',   age: 28, gender: 'F', doctor: 'Dr. Meera Nair',    admittedAt: '2026-05-13', condition: 'Eczema'         },
  { id: 'P-3005', name: 'Anaya Bhatia',   age: 5,  gender: 'F', doctor: 'Dr. Priya Iyer',    admittedAt: '2026-05-10', condition: 'Fever'          },
  { id: 'P-3006', name: 'Rohit Kapoor',   age: 41, gender: 'M', doctor: 'Dr. Vihaan Gupta',  admittedAt: '2026-05-09', condition: 'Migraine'       },
  { id: 'P-3007', name: 'Mira Khanna',    age: 67, gender: 'F', doctor: 'Dr. Arjun Khanna',  admittedAt: '2026-05-08', condition: 'Gallstones'     },
  { id: 'P-3008', name: 'Veer Pandey',    age: 14, gender: 'M', doctor: 'Dr. Tara Sethi',    admittedAt: '2026-05-12', condition: 'Diabetes (T1)'  },
  { id: 'P-3009', name: 'Ishita Roy',     age: 45, gender: 'F', doctor: 'Dr. Saanvi Joshi',  admittedAt: '2026-05-11', condition: 'Routine check'  },
  { id: 'P-3010', name: 'Karan Bose',     age: 30, gender: 'M', doctor: 'Dr. Ishaan Verma',  admittedAt: '2026-05-13', condition: 'Anxiety'        },
];

const APPOINTMENTS = [
  { id: 'A-1', time: '09:00', duration: '30m', patient: 'Aarav Singh',  doctor: 'Dr. Aanya Sharma', department: 'Cardiology',  status: 'Scheduled' },
  { id: 'A-2', time: '09:30', duration: '20m', patient: 'Diya Reddy',   doctor: 'Dr. Priya Iyer',   department: 'Pediatrics',  status: 'Completed' },
  { id: 'A-3', time: '10:00', duration: '45m', patient: 'Kunal Mehta',  doctor: 'Dr. Rohan Mehta',  department: 'Orthopedics', status: 'Scheduled' },
  { id: 'A-4', time: '10:45', duration: '15m', patient: 'Saanvi Joshi', doctor: 'Dr. Meera Nair',   department: 'Dermatology', status: 'No-show'   },
  { id: 'A-5', time: '11:15', duration: '30m', patient: 'Rohit Kapoor', doctor: 'Dr. Vihaan Gupta', department: 'Neurology',   status: 'Scheduled' },
  { id: 'A-6', time: '12:00', duration: '20m', patient: 'Mira Khanna',  doctor: 'Dr. Arjun Khanna', department: 'Surgery',     status: 'Cancelled' },
];

const ACTIVITY = [
  { id: 1, kind: 'admission',  title: 'Aarav Singh admitted to ICU', subtitle: 'By Dr. Aanya Sharma', time: '2m ago',
    icon: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M5 21h14M9 7h6M9 11h6M9 15h6' },
  { id: 2, kind: 'appointment',title: 'Appointment confirmed',       subtitle: 'Diya Reddy · Pediatrics 09:30', time: '12m ago',
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { id: 3, kind: 'alert',      title: 'Paracetamol stock below threshold', subtitle: '40 units left · reorder suggested', time: '38m ago',
    icon: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
  { id: 4, kind: 'discharge',  title: 'Mira Khanna discharged',       subtitle: 'Post-op recovery complete',     time: '1h ago',
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
  { id: 5, kind: 'admission',  title: 'Karan Bose admitted',          subtitle: 'Psychiatry · Dr. Ishaan Verma', time: '2h ago',
    icon: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M5 21h14M9 7h6M9 11h6M9 15h6' },
];

const NOTIFICATIONS = [
  { id: 1, tone: 'warning', label: 'Stock',     title: 'Paracetamol below threshold', detail: '40 units remaining across all branches', time: 'Just now' },
  { id: 2, tone: 'info',    label: 'Schedule',  title: 'Dr. Iyer’s clinic moved to 11:00', detail: 'Auto-rescheduled 2 appointments',  time: '15m ago' },
  { id: 3, tone: 'success', label: 'Approved',  title: 'New nurse onboarded', detail: 'Tara Pillai joined the ICU team',           time: '2h ago' },
];

const ADMISSIONS_7D = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 21 },
  { day: 'Fri', count: 19 },
  { day: 'Sat', count: 9 },
  { day: 'Sun', count: 7 },
];

export async function getDoctors()      { await delay(120); return DOCTORS; }
export async function getStaff()        { await delay(120); return STAFF; }
export async function getPatients()     { await delay(140); return PATIENTS; }
export async function getAppointments() { await delay(120); return APPOINTMENTS; }
export async function getActivity()     { await delay(80);  return ACTIVITY; }
export async function getNotifications(){ await delay(80);  return NOTIFICATIONS; }
export async function getAdmissions7d() { await delay(80);  return ADMISSIONS_7D; }

export function appointmentsStatusBreakdown(appointments) {
  return ['Scheduled', 'Completed', 'No-show', 'Cancelled'].map((name) => ({
    name,
    value: appointments.filter((a) => a.status === name).length,
  }));
}
