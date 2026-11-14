import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createMiddleware } from 'hono/factory';
import type { AppEnv, Deps } from './types';
import { fail, ok, MSG } from './errors';
import { requireInternal, requireUser } from './guard';
import { meRoutes } from './routes/me';
import { codesRoutes } from './routes/codes';
import { ebookRoutes } from './routes/ebook';
import { publicRoutes } from './routes/public';
import { adminRoutes, COACH_ROUTES } from './routes/admin';
import { internalRoutes } from './routes/internal';

const API_BODY_LIMIT = 16 * 1024;
/** Apps Script forwards the full BCL transaction (purchase.raw, bcl-log payload). */
const INTERNAL_BODY_LIMIT = 256 * 1024;

export function createApp(deps: Deps) {
  const app = new Hono<AppEnv>();

  // CORS: only listed origins are echoed back; preflight always answered.
  app.use('*', async (c, next) => {
    const origin = c.req.header('Origin');
    const allowed = !!origin && deps.allowedOrigins.includes(origin);
    if (c.req.method === 'OPTIONS') {
      const h = new Headers({ Vary: 'Origin' });
      if (allowed) {
        h.set('Access-Control-Allow-Origin', origin!);
        h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        h.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
        h.set('Access-Control-Max-Age', '86400');
      }
      return new Response(null, { status: 204, headers: h });
    }
    await next();
    c.res.headers.append('Vary', 'Origin');
    if (allowed) c.res.headers.set('Access-Control-Allow-Origin', origin!);
  });

  // Request bodies are small JSON documents everywhere.
  const tooLarge = (c: Parameters<typeof fail>[0]) => fail(c, 413, 'terlalu_besar');
  app.use('/api/*', bodyLimit({ maxSize: API_BODY_LIMIT, onError: tooLarge }));
  app.use('/internal/*', bodyLimit({ maxSize: INTERNAL_BODY_LIMIT, onError: tooLarge }));

  // Admin boundary: EVERY /api/admin/* path (existing or not) needs a profile with the superadmin role,
  // except plain GETs of the coach read-only routes (COACH_ROUTES), which a coach may also call.
  app.use(
    '/api/admin/*',
    requireUser(deps),
    createMiddleware<AppEnv>(async (c, next) => {
      const roles = c.get('user').roles;
      const coachOk = roles.includes('coach') && c.req.method === 'GET' && COACH_ROUTES.some((re) => re.test(c.req.path));
      if (!roles.includes('superadmin') && !coachOk) return fail(c, 403, 'tiada_kebenaran');
      await next();
    }),
  );
  app.get('/api/admin/ping', (c) => ok(c, { pong: true }));
  app.route('/api/admin', adminRoutes(deps));

  // Public routes (no token).
  app.route('/api', publicRoutes(deps));

  // Participant routes (each route carries requireUser itself).
  app.route('/api', meRoutes(deps));
  app.route('/api', codesRoutes(deps));
  app.route('/api', ebookRoutes(deps));

  app.post('/internal/ping', requireInternal(deps), (c) => ok(c, { pong: true }));
  app.route('/internal', internalRoutes(deps));

  app.notFound((c) => fail(c, 404, 'tiada'));
  app.onError((err, c) => {
    console.error('unhandled', err instanceof Error ? err.message : String(err));
    return fail(c, 500, 'ralat_pelayan', MSG.ralat_pelayan);
  });

  return app;
}
