import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';
import { Search } from "lucide-react";
import logo2 from "../../assets/picture/logo2.png";

// Only real destinations: Home (route) + on-page section anchors. Dead routes
// (/catalog, /pricing, /about, /contact) removed.
const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Remedies', href: '#products' },
  { label: 'Our Story', href: '#philosophy' },
  { label: 'Contact', href: '#contact' },
  { label: 'Book Appoinment ', href: "#consult" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={logo2}
        alt="Deopuri Herbal"
        className="h-12 w-auto object-contain"
      />
    </Link>
  );
}


export default function Navbar() {
  const scrolled = useScrollPosition(8);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <header
      style={{ backgroundColor: scrolled ? "#f1faf7" : "#d5f0e4" }}
      className={[
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "shadow-lg border-b border-gray-200"
          : "",
      ].join(" ")}

    >
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-10 lg:gap-12 md:flex">
          {NAV_LINKS.map((link) => (
            link.to ? (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  [
                    "text-[15px] font-semibold transition-all duration-300",
                    isActive
                      ? "text-brand-700"
                      : "text-gray-700 hover:text-brand-700",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900"
              >
                {link.label}
              </a>
            )
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
  type="text"
  placeholder="Search herbal products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-64 rounded-full border border-green-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
/>
          </div>

          <Button as={Link} to="/login" variant="ghost" size="sm">
            Sign in
          </Button>

          <Button as={Link} to="/register" size="sm">
            Get started
          </Button>

        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </Container>

      <div
        className={[
          'md:hidden overflow-hidden border-t border-ink-100 bg-white/95 backdrop-blur transition-[max-height,opacity] duration-300',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <Container className="space-y-1 py-4">
          {NAV_LINKS.map((link) => (
            link.to ? (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    'block rounded-lg px-3 py-2 text-base font-medium transition-colors',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-100',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-ink-700 transition-colors hover:bg-ink-100"
              >
                {link.label}
              </a>
            )
          ))}

          <div className="grid grid-cols-2 gap-2 pt-3">
            <Button
              as={NavLink}
              to="/login"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-700 text-white"
                  : "text-gray-700 hover:bg-green-100"
              }
            >
              Sign in
            </Button>

            <Button
              as={NavLink}
              to="/register"
              size="sm"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-700 text-white"
                  : ""
              }
            >
              Get started
            </Button>
          </div>

        </Container>
      </div>
    </header>
  );
}
