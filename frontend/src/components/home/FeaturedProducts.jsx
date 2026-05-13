import { Link } from 'react-router-dom';
import Container from '../ui/Container.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import ProductCard from './ProductCard.jsx';
import { getFeaturedProducts } from '../../services/products.js';
import { useReveal } from '../../hooks/useReveal.js';

export default function FeaturedProducts() {
  const products = getFeaturedProducts();
  const [ref, revealed] = useReveal();

  return (
    <section id="featured" className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Featured catalog"
            title="Trusted essentials, always in stock"
            description="A curated slice of what shops sell every day. Real-time inventory keeps the shelves honest."
          />
          <Button as={Link} to="/catalog" variant="secondary" size="md">
            View full catalog
            <span aria-hidden="true">→</span>
          </Button>
        </div>

        <div
          ref={ref}
          className={[
            'mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
            revealed ? 'animate-fade-up' : 'opacity-0',
          ].join(' ')}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
