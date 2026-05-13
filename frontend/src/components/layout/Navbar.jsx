import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
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
      <span className="font-display text-lg font-bold tracking-tight text-ink-900">
        Deopuri
      </span>
    </Link>
  );
}

export default function Navbar() {
  const scrolled = useScrollPosition(8);
  const [open, setOpen] = useState(false);

  return (
    <header
      className={[
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-ink-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70'
          : 'bg-transparent',
      ].join(' ')}
    >
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                [
                  'text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-brand-700' : 'text-ink-600 hover:text-ink-900',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
            <NavLink
              key={link.to}
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
          ))}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Button as={Link} to="/login" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Sign in
            </Button>
            <Button as={Link} to="/register" size="sm" onClick={() => setOpen(false)}>
              Get started
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
