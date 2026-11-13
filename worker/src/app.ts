import { Hono } from 'hono';
import type { AppEnv, Deps } from './types';
import { fail, ok, MSG } from './errors';
import { requireInternal, requireRole, requireUser } from './guard';

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

  app.get('/api/me', requireUser(deps), (c) => ok(c, c.get('user')));
  app.get('/api/admin/ping', requireUser(deps), requireRole('admin'), (c) => ok(c, { pong: true }));
  app.post('/internal/ping', requireInternal(deps), (c) => ok(c, { pong: true }));

  app.notFound((c) => fail(c, 404, 'tiada'));
  app.onError((err, c) => {
    console.error('unhandled', err instanceof Error ? err.message : String(err));
    return fail(c, 500, 'ralat_pelayan', MSG.ralat_pelayan);
  });

  return app;
}
