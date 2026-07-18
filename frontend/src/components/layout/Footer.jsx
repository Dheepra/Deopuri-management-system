import { Link } from 'react-router-dom';
import Container from '../ui/Container.jsx';
import logo2 from "../../assets/picture/logo2.png";

// Only real destinations — on-page section anchors + working auth routes.
const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Remedies', href: '#products' },
      { label: 'Our Story', href: '#philosophy' },
      { label: 'Contact', href: '#contact' },
      { label: 'Book consultation', href: '#consult' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Get started', to: '/register' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100 bg-gradient-to-b from-white to-brand-50/40">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center">
              <img src={logo2} alt="Deopuri Herbal" className="h-16 w-20 object-contain" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink-600">
              🌿 Pure Ayurvedic wellness — herbal remedies crafted with nature's care, for your everyday balance.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-ink-900">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="text-sm text-ink-600 transition-colors hover:text-brand-700">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-ink-600 transition-colors hover:text-brand-700">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-ink-100 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Deopuri Herbal. All rights reserved.
          </p>
          <p className="text-xs text-ink-400">Made with 🌱 &amp; care.</p>
        </div>
      </Container>
    </footer>
  );
}
