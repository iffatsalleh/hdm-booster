// DEV MOCK ONLY: fake Firebase Auth port.
import type { AuthPort, AuthUser } from '../lib/firebase';
import { authError, db, delay } from './db';

const subs = new Set<(u: AuthUser | null) => void>();
const me = (): AuthUser | null => {
  const a = db.current();
  return a ? { uid: a.uid, email: a.email } : null;
};
const emit = () => subs.forEach((f) => f(me()));

export const mockAuth: AuthPort = {
  onChange(cb) {
    subs.add(cb);
    setTimeout(() => cb(me()), 150); // Firebase reports the persisted user asynchronously
    return () => subs.delete(cb);
  },
  async signIn(email, password) {
    await delay();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw authError('auth/invalid-email');
    const a = db.byEmail(email.trim().toLowerCase());
    if (!a || a.password !== password) throw authError('auth/invalid-credential');
    db.setUid(a.uid);
    emit();
  },
  async resetPassword(email) {
    await delay();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw authError('auth/invalid-email');
    console.info('[mock] password reset email to', email);
  },
  async signOut() {
    db.setUid(null);
    emit();
  },
  async getIdToken() {
    const a = db.current();
    return a ? `mock-token-${a.uid}` : null;
  },
};
