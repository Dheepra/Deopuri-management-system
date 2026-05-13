import Container from '../ui/Container.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import { aboutImage } from '../../assets/picture';
import { useReveal } from '../../hooks/useReveal.js';

const FEATURES = [
  {
    title: 'Built for independent shops',
    description:
      'Local-first by design. Works offline, syncs the moment your connection is back.',
    icon: (
      <path d="M3 21V8l9-5 9 5v13M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Inventory you can trust',
    description:
      'Variant-level stock with expiry tracking, low-stock alerts, and supplier reorder hints.',
    icon: (
      <path
        d="M3 7h18M5 7v13h14V7M9 11h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Compliance, quietly',
    description:
      'Audit trails, role-based access, and approval workflows the regulator will appreciate.',
    icon: (
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function About() {
  const [ref, revealed] = useReveal();

  return (
    <section id="about" className="bg-white py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div ref={ref} className={revealed ? 'animate-fade-up' : 'opacity-0'}>
          <SectionHeading
            eyebrow="Why Deopuri"
            title="Less software. More shop."
            description="We started Deopuri because medicine shops deserve software that respects their day. Calm interfaces. Real-time numbers. Zero training."
          />

          <ul className="mt-10 space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    {feature.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-ink-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-600">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-bl from-brand-100 to-white"
          />
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-card)] ring-1 ring-ink-100">
            <img
              src={aboutImage}
              alt="Deopuri customer storefront"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
