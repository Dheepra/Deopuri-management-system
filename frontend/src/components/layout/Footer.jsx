import { Link } from 'react-router-dom';
import Container from '../ui/Container.jsx';
import logo2 from "../../assets/picture/logo2.png";

// Only real destinations — on-page section anchors + working auth routes.
const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: "Home", to: "/" },
  { label: "Remedies", href: "#products" },
  { label: "Our Story", href: "#philosophy" },
  { label: "Contact", href: "#contact" },
  { label: "Book Appointment", href: "#consult" }, 
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
   <footer
  style={{ backgroundColor: "#d5f0e4" }}
  className="border-t border-gray-300 text-gray-800"
>
  <Container className="py-14">
    <div className="grid gap-10 md:grid-cols-3">
      <div>
        <img src={logo2} alt="Deopuri Herbal" className="h-12 w-auto" />

        <p className="mt-4 text-sm text-gray-700 leading-6">
          🌿 Pure Ayurvedic wellness — herbal remedies crafted with nature's
          care, for your everyday balance.
        </p>
      </div>

      {COLUMNS.map((column) => (
        <div key={column.title}>
          <h4 className="text-sm font-semibold text-gray-900">
            {column.title}
          </h4>

          <ul className="mt-4 space-y-2.5">
            {column.links.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="text-sm text-gray-700 transition-colors hover:text-green-700"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-sm text-gray-700 transition-colors hover:text-green-700"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-gray-300 pt-6 sm:flex-row sm:items-center">
      <p className="text-xs text-gray-700">
        © {new Date().getFullYear()} Deopuri Herbal. All rights reserved.
      </p>

      <p className="text-xs text-gray-600">
        Made with 🌱 &amp; care.
      </p>
    </div>
  </Container>
</footer>
  );
}
