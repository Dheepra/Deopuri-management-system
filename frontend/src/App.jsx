import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1c2538',
            boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.18)',
            backdropFilter: 'blur(8px)',
            fontSize: '14px',
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#1f9b6e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </>
  );
}
