import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function Unauthorized() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">403</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink-900">No access</h1>
        <p className="mt-3 max-w-md text-ink-600">
          This area is reserved for Company Admins. If you think this is a mistake, contact
          your workspace owner.
        </p>
        <Button as={Link} to="/" className="mt-8">
          Back to home
        </Button>
      </div>
    </div>
  );
}
