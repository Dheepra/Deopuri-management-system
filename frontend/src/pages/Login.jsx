import EnterpriseAuthLayout from '../layouts/EnterpriseAuthLayout.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';

const BULLETS = [
  {
    label: 'One login, three consoles',
    hint: 'You land on the right dashboard for your role automatically.',
    icon: 'M5 12h14M13 5l7 7-7 7',
  },
  {
    label: 'Real-time inventory',
    hint: 'Variant-level stock and expiry, synced instantly.',
    icon: 'M3 7h18M5 7v13h14V7M9 11h6',
  },
  {
    label: 'Designed for clarity',
    hint: 'A calm interface your team will actually enjoy.',
    icon: 'M3 12h18M12 3v18',
  },
];

export default function Login() {
  return (
    <EnterpriseAuthLayout
      title="Welcome back"
      subtitle="Sign in to your admin console. You will be redirected based on your role."
      formEyebrow="Sign in"
      tagline="One quiet dashboard. Built for your role."
      bullets={BULLETS}
    >
      <LoginForm />
    </EnterpriseAuthLayout>
  );
}
