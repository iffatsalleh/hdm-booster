// Firebase Auth behind a small port. Accounts are created ONLY by the Worker (/api/register);
// the browser signs in, resets passwords, signs out, watches state and reads ID tokens.
// With VITE_MOCK=1 (npm run dev:mock) an in-memory fake from src/mock/ is used instead; that branch is
// statically false in production builds, so the mock is not bundled.
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  type Auth,
} from 'firebase/auth';
import { config } from './config';

export type AuthUser = { uid: string; email: string | null };

export interface AuthPort {
  onChange(cb: (u: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
  /** null when signed out. force=true refreshes the token from Firebase. */
  getIdToken(force?: boolean): Promise<string | null>;
}

function firebasePort(): AuthPort {
  const app = initializeApp(config.firebase);
  const auth: Auth = initializeAuth(app, { persistence: browserLocalPersistence });
  auth.languageCode = 'ms';
  return {
    onChange: (cb) => onAuthStateChanged(auth, (u) => cb(u ? { uid: u.uid, email: u.email } : null)),
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
    signOut: () => fbSignOut(auth),
    getIdToken: async (force) => (auth.currentUser ? auth.currentUser.getIdToken(!!force) : null),
  };
}

let port: Promise<AuthPort> | null = null;

export function authPort(): Promise<AuthPort> {
  if (!port) {
    port =
      import.meta.env.VITE_MOCK === '1'
        ? import('../mock/auth').then((m) => m.mockAuth)
        : Promise.resolve().then(firebasePort);
  }
  return port;
}
