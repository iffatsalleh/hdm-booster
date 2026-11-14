// Production wiring only. Tests build the app with createApp(fakeDeps).
import { createApp } from './app';
import { firebaseVerifier } from './auth';
import { createHive } from './hive';
import { createPgHive } from './hivePg';
import { createFirebaseAdmin } from './firebaseAdmin';
import type { Deps, FirebaseAdmin, Hive } from './types';

export interface Env {
  /** Cloudflare Hyperdrive binding (wrangler.toml [[hyperdrive]]). Preferred data path. */
  HYPERDRIVE?: { connectionString: string };
  /** HornetHive REST fallback, used only when HYPERDRIVE is not bound. */
  HIVE_DML_KEY?: string;
  HIVE_API_BASE: string;
  HIVE_DB_ID: string;
  INTERNAL_SECRET: string;
  TICKET_SECRET: string;
  FIREBASE_SA_JSON: string;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_ORIGINS: string;
  GAS_URL: string;
}

type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException?(): void };

// Per-isolate singletons: JWKS cache and the OAuth access token survive across requests.
let verifier: Deps['verifyToken'] | undefined;
let firebaseAdmin: FirebaseAdmin | undefined;

export default {
  async fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> {
    verifier ??= firebaseVerifier(env.FIREBASE_PROJECT_ID);
    firebaseAdmin ??= createFirebaseAdmin({ saJson: env.FIREBASE_SA_JSON, projectId: env.FIREBASE_PROJECT_ID });

    // Hyperdrive: a new pg Client per request (never shared across requests), ended after the response.
    const pgHive = env.HYPERDRIVE ? createPgHive(env.HYPERDRIVE.connectionString) : null;
    const hive: Hive = pgHive ?? createHive({ base: env.HIVE_API_BASE, dbId: env.HIVE_DB_ID, key: env.HIVE_DML_KEY ?? '' });

    const deps: Deps = {
      verifyToken: verifier,
      hive,
      firebaseAdmin,
      secrets: { internal: env.INTERNAL_SECRET, ticket: env.TICKET_SECRET },
      gasUrl: env.GAS_URL,
      now: () => Date.now(),
      allowedOrigins: (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      return await createApp(deps).fetch(req, env, ctx as never);
    } finally {
      if (pgHive) ctx.waitUntil(pgHive.close());
    }
  },
};
