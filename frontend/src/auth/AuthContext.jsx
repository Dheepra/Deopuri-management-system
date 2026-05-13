import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'auth.session';

export const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const persistSession = useCallback((next) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSession(next);
  }, []);

  // Keep tabs in sync — sign-out in one tab signs out everywhere.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setSession(readStoredSession());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.token),
      token: session?.token ?? null,
      role: session?.role ?? null,
      user: session?.user ?? null,
      signIn: persistSession,
      signOut: () => persistSession(null),
    }),
    [session, persistSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
