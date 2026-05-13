import { Link } from 'react-router-dom';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';
import { heroImage } from '../../assets/picture';

const STATS = [
  { label: 'Shops onboarded', value: '1,200+' },
  { label: 'Orders processed', value: '4.6M' },
  { label: 'Uptime', value: '99.98%' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#d3f0e3_0%,transparent_70%)]"
      />
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 shadow-sm ring-1 ring-ink-100">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            New · Inventory v2 is live
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Run your medical shop{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              with confidence
            </span>
            .
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-ink-600 sm:text-lg">
            Deopuri unifies catalog, inventory, sales and orders for independent pharmacies.
            One calm dashboard. No spreadsheets. No double entry.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to="/register" size="lg">
              Start free trial
              <span aria-hidden="true">→</span>
            </Button>
            <Button as={Link} to="/catalog" size="lg" variant="secondary">
              View catalog
            </Button>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold text-ink-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-100 via-white to-brand-50 blur-2xl" />
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-card-hover)] ring-1 ring-ink-100">
            <img
              src={heroImage}
              alt="Deopuri dashboard preview"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              loading="eager"
            />
          </div>
          <div className="animate-float absolute -bottom-6 -left-6 hidden rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)] ring-1 ring-ink-100 sm:flex sm:items-center sm:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-medium text-ink-500">Order #4821</p>
              <p className="text-sm font-semibold text-ink-900">Delivered in 22 min</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
