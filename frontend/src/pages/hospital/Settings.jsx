import { useAuth } from '../../auth/useAuth.js';
import { ROLE_LABELS } from '../../auth/roles.js';
import Button from '../../components/ui/Button.jsx';

function Field({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-ink-100 py-4 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-ink-500">{label}</dt>
      <dd className="text-sm text-ink-900 sm:col-span-2">{value ?? '—'}</dd>
    </div>
  );
}

export default function Settings() {
  const { user, role } = useAuth();

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Settings
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          Profile &amp; preferences
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Your administrator details, signed in from the current device.
        </p>
      </header>

      <div className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
        <header className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Account</h2>
          <Button size="sm" variant="secondary">Edit profile</Button>
        </header>
        <dl className="mt-4">
          <Field label="Email" value={user?.email} />
          <Field label="Frontend role" value={ROLE_LABELS[role]} />
          <Field label="Backend role" value={user?.backendRole} />
        </dl>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
        <header className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Security</h2>
          <Button size="sm" variant="secondary">Change password</Button>
        </header>
        <p className="mt-3 text-sm text-ink-600">
          Two-factor auth and session management ship in a later release.
        </p>
      </div>
    </section>
  );
}
