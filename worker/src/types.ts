export interface Hive {
  q<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Exactly one row expected; throws otherwise. */
  one<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T>;
  /**
   * Worker rule: every Worker query selects exactly ONE row with ONE jsonb column named `r`.
   * Returns that value, JSON.parse-d when the transport hands jsonb back as a string (REST does).
   */
  json<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
}

/** Firebase Admin operations (worker/src/firebaseAdmin.ts; tests use an in-memory fake). */
export interface FirebaseAdmin {
  /** createdAt: account creation time in ms (null when Firebase does not report it). */
  getUserByEmail(email: string): Promise<{ uid: string; email: string; createdAt: number | null } | null>;
  /** Rejects with `code: 'EMAIL_EXISTS'` when the email already has an account. */
  createUser(user: { email: string; password: string; displayName?: string }): Promise<{ uid: string; email?: string }>;
  deleteUser(uid: string): Promise<void>;
  setPassword(uid: string, password: string): Promise<void>;
}

export type Role = string;

export type AuthUser = { uid: string; email: string; roles: Role[]; hasProfile: boolean };

export type Deps = {
  verifyToken(tok: string): Promise<{ uid: string; email: string } | null>;
  hive: Hive;
  firebaseAdmin: FirebaseAdmin;
  secrets: { internal: string; ticket: string };
  gasUrl: string;
  /** Current time in milliseconds. */
  now(): number;
  /** Origins allowed by CORS (parsed from ALLOWED_ORIGINS). */
  allowedOrigins: string[];
  /** Outbound fetch (Worker -> Apps Script). Defaults to the global fetch. */
  fetch?: typeof fetch;
};

export type AppEnv = { Variables: { user: AuthUser } };
