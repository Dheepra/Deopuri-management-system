import EnterpriseAuthLayout from '../layouts/EnterpriseAuthLayout.jsx';
import SignupForm from '../components/auth/SignupForm.jsx';

const BULLETS = [
  {
    label: 'Built for healthcare teams',
    hint: 'Hospitals and medical shops on a shared platform.',
    icon: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M9 7h6M9 11h6M9 15h6',
  },
  {
    label: 'Approval before access',
    hint: 'New accounts are reviewed by a Company Admin before sign-in.',
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  },
  {
    label: 'Role-based experience',
    hint: 'Your dashboard is tailored to your role from day one.',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
];

export default function Signup() {
  return (
    <EnterpriseAuthLayout
      title="Create your account"
      subtitle="Pick the role that matches your workspace. An administrator will approve your account before you can sign in."
      formEyebrow="Sign up"
      tagline="One platform. Multiple roles. Calm software."
      bullets={BULLETS}
    >
      <SignupForm />
    </EnterpriseAuthLayout>
  );
}
