import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { useScrollToTop } from '../../hooks/useScrollToTop.js';

export default function Layout() {
  useScrollToTop();
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
