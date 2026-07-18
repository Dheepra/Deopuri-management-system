import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { refreshSession } from '../services/auth.js';

const STORAGE_KEY = 'auth.session';

// Sliding-session tuning. Token lives 10 min on the backend; while the user is active we
// swap it for a fresh one every 5 min (so it never runs out), and after 10 min of no
// activity we let the session lapse and bounce to login.
const IDLE_LIMIT_MS = 10 * 60 * 1000;   // no activity for this long -> logout
const REFRESH_EVERY_MS = 5 * 60 * 1000; // while active, refresh the token this often
const CHECK_EVERY_MS = 30 * 1000;       // how often we evaluate idle / refresh

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

  // Track the last time the user actually did something.
  const lastActivityRef = useRef(Date.now());
  const lastRefreshRef = useRef(Date.now());

  useEffect(() => {
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, []);

  // Idle watchdog + activity-driven token refresh. Only runs while signed in.
  useEffect(() => {
    if (!session?.token) return undefined;

    // Restart the refresh clock whenever we (re)enter with a new token.
    lastRefreshRef.current = Date.now();

    const bounceToLogin = () => {
      persistSession(null);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login?expired=1');
      }
    };

    const id = setInterval(async () => {
      const now = Date.now();

      // 1) Idle too long -> expire the session.
      if (now - lastActivityRef.current >= IDLE_LIMIT_MS) {
        bounceToLogin();
        return;
      }

      // 2) Active and the token is getting old -> refresh it.
      if (now - lastRefreshRef.current >= REFRESH_EVERY_MS) {
        lastRefreshRef.current = now; // guard against overlapping calls
        try {
          const token = await refreshSession();
          if (token) {
            setSession((prev) => {
              if (!prev) return prev;
              const nextSession = { ...prev, token };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
              return nextSession;
            });
          }
        } catch {
          // Token already invalid — give up the session.
          bounceToLogin();
        }
      }
    }, CHECK_EVERY_MS);

    return () => clearInterval(id);
  }, [session?.token, persistSession]);

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
