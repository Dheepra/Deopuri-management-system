import { Link } from 'react-router-dom';
import EnterpriseAuthLayout from '../layouts/EnterpriseAuthLayout.jsx';

export default function ForgotPassword() {
  return (
    <EnterpriseAuthLayout
      title="Reset password"
      subtitle="Password recovery is coming soon. Please contact your workspace owner to reset your password."
      formEyebrow="Forgot password"
      tagline="Secure access for every admin."
    >
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        <span aria-hidden="true">←</span>
        Back to sign in
      </Link>
    </EnterpriseAuthLayout>
  );
}
