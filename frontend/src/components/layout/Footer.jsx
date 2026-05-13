import { Link } from 'react-router-dom';
import Container from '../ui/Container.jsx';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Catalog', to: '/catalog' },
      { label: 'Inventory', to: '/inventory' },
      { label: 'Orders', to: '/orders' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Customers', to: '/customers' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', to: '/docs' },
      { label: 'Changelog', to: '/changelog' },
      { label: 'Support', to: '/support' },
      { label: 'Status', to: '/status' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100 bg-white">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold text-ink-900">Deopuri</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink-600">
              Modern management for medical shops. Catalog, sales, and orders in one calm
              dashboard.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-ink-900">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-600 transition-colors hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Deopuri. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-500">
            <Link to="/privacy" className="hover:text-ink-800">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink-800">
              Terms
            </Link>
            <Link to="/security" className="hover:text-ink-800">
              Security
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
