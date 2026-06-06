import { Link } from "react-router-dom";
import Hero from '../components/home/Hero.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import About from '../components/home/About.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <About />

      <Link
  to="/appointment"
  className="fixed right-10 bottom-10 z-50
             flex items-center gap-2
             bg-[#157d58] hover:bg-[#12694a]
             text-white font-semibold
             px-5 py-3 rounded-full shadow-lg
             transition-all duration-300"
>
  📅 Book Appointment
</Link>
    </>
  );
}