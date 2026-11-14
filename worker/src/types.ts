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

/** Firebase Admin operations (implemented in Task 8). */
export interface FirebaseAdmin {
  getUserByEmail(email: string): Promise<{ uid: string; email: string } | null>;
  createUser(email: string, password: string): Promise<{ uid: string }>;
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
};

export type AppEnv = { Variables: { user: AuthUser } };
