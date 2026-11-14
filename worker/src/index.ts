// Production wiring only. Tests build the app with createApp(fakeDeps).
import { createApp } from './app';
import { firebaseVerifier } from './auth';
import { createHive } from './hive';
import { createFirebaseAdmin } from './firebaseAdmin';
import type { Deps, FirebaseAdmin } from './types';

export interface Env {
  HIVE_DML_KEY: string;
  INTERNAL_SECRET: string;
  TICKET_SECRET: string;
  FIREBASE_SA_JSON: string;
  HIVE_API_BASE: string;
  HIVE_DB_ID: string;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_ORIGINS: string;
  GAS_URL: string;
}

// Per-isolate singletons: JWKS cache and the OAuth access token survive across requests.
let verifier: Deps['verifyToken'] | undefined;
let firebaseAdmin: FirebaseAdmin | undefined;

export default {
  fetch(req: Request, env: Env, ctx: unknown): Response | Promise<Response> {
    verifier ??= firebaseVerifier(env.FIREBASE_PROJECT_ID);
    firebaseAdmin ??= createFirebaseAdmin({ saJson: env.FIREBASE_SA_JSON, projectId: env.FIREBASE_PROJECT_ID });
    const deps: Deps = {
      verifyToken: verifier,
      hive: createHive({ base: env.HIVE_API_BASE, dbId: env.HIVE_DB_ID, key: env.HIVE_DML_KEY }),
      firebaseAdmin,
      secrets: { internal: env.INTERNAL_SECRET, ticket: env.TICKET_SECRET },
      gasUrl: env.GAS_URL,
      now: () => Date.now(),
      allowedOrigins: (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    };
    return createApp(deps).fetch(req, env, ctx as never);
  },
};
