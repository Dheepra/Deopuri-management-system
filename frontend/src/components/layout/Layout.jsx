import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { useScrollToTop } from '../../hooks/useScrollToTop.js';

export default function Layout() {
  useScrollToTop();
  return (
    // Framed window: the whole marketing page sits inside one rounded, gradient-bordered frame with a
    // small gap to the browser edge. The content scrolls inside the frame so corners stay clean.
    <div className="bg-ink-100 lg:h-dvh lg:overflow-hidden lg:p-1.5">
      <div className="lg:h-full lg:rounded-[2rem] lg:bg-gradient-to-br lg:from-brand-400 lg:via-emerald-400 lg:to-brand-600 lg:p-[2px] lg:shadow-card">
        <div className="bg-ink-50 lg:h-full lg:overflow-hidden lg:rounded-[1.9rem]">
          <div className="flex min-h-dvh flex-col lg:h-full lg:overflow-y-auto">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
