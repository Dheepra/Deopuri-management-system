import { Link } from 'react-router-dom';
import Container from '../components/ui/Container.jsx';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <Container className="grid place-items-center py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-600">
        The page you’re looking for has moved or never existed.
      </p>
      <Button as={Link} to="/" className="mt-8">
        Back to home
      </Button>
    </Container>
  );
}
