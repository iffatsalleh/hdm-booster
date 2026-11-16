// The Worker route inventory, shared by the fake-Hive security suite (tests/security, runs in `npm test` and
// before every deploy) and the DB-backed suite (tests/worker/security.test.ts). Adding a route to the Worker
// without listing it here fails both suites.

export type Route = { method: string; path: (ebook: string) => string; body?: Record<string, unknown> };

/** EVERY participant route. */
export const ROUTES: Route[] = [
  { method: 'GET', path: () => '/api/me' },
  { method: 'PUT', path: () => '/api/me/onboarding',
    body: { sex: 'L', birth_year: 1990, height_cm: 170, start_weight_kg: 80, activity_level: 2, health_ack: true, privacy_ack: true } },
  { method: 'PUT', path: () => '/api/me/targets', body: { tdee_kcal: 2400, kcal_target: 1900, protein_target_g: 140 } },
  { method: 'PUT', path: () => '/api/me/name', body: { full_name: 'Nama A' } },
  { method: 'GET', path: () => '/api/me/access' },
  { method: 'GET', path: () => '/api/groups' },
  { method: 'POST', path: () => '/api/codes/redeem', body: { code: 'HDMB-AAAA-AAAA' } },
  { method: 'POST', path: (e) => `/api/ebook/${e}/ticket` },
  { method: 'PUT', path: (e) => `/api/ebook/${e}/progress`, body: { last_page: 7, finished: false } },
];
export const label = (r: Route) => `${r.method} ${r.path(':id')}`;

/** EVERY /api/admin/* route (Hono pattern). coach: true = Coach Iffat may call it (read-only). */
export type AdminRoute = { method: string; pattern: string; coach?: boolean };
export const ADMIN_ROUTE_LIST: AdminRoute[] = [
  { method: 'GET', pattern: '/api/admin/ping' },
  { method: 'GET', pattern: '/api/admin/summary', coach: true },
  { method: 'GET', pattern: '/api/admin/participants', coach: true },
  { method: 'GET', pattern: '/api/admin/participants/:uid', coach: true },
  { method: 'POST', pattern: '/api/admin/participants/:uid/grant' },
  { method: 'POST', pattern: '/api/admin/participants/:uid/reset-password' },
  { method: 'POST', pattern: '/api/admin/grants/:id/revoke' },
  { method: 'GET', pattern: '/api/admin/purchases' },
  { method: 'POST', pattern: '/api/admin/purchases' },
  { method: 'POST', pattern: '/api/admin/purchases/:id/action' },
  { method: 'POST', pattern: '/api/admin/purchases/:id/reprocess' },
  { method: 'POST', pattern: '/api/admin/purchases/:id/resend-welcome' },
  { method: 'GET', pattern: '/api/admin/orders/orphans' },
  { method: 'POST', pattern: '/api/admin/orders/:orderRef/reprocess' },
  { method: 'GET', pattern: '/api/admin/bcl-map' },
  { method: 'GET', pattern: '/api/admin/bcl-map/:id' },
  { method: 'POST', pattern: '/api/admin/bcl-map' },
  { method: 'PUT', pattern: '/api/admin/bcl-map/:id' },
  { method: 'DELETE', pattern: '/api/admin/bcl-map/:id' },
  { method: 'GET', pattern: '/api/admin/codes' },
  { method: 'POST', pattern: '/api/admin/codes/generate' },
  { method: 'POST', pattern: '/api/admin/codes/:id/action' },
  { method: 'GET', pattern: '/api/admin/content/:table' },
  { method: 'GET', pattern: '/api/admin/content/:table/:id' },
  { method: 'POST', pattern: '/api/admin/content/:table' },
  { method: 'PUT', pattern: '/api/admin/content/:table/:id' },
  { method: 'DELETE', pattern: '/api/admin/content/:table/:id' },
  { method: 'GET', pattern: '/api/admin/audit' },
];

/** EVERY /internal/* route (HMAC-signed, Apps Script only). */
export const INTERNAL_ROUTES = [
  'POST /internal/ping',
  'GET /internal/bcl-config',
  'POST /internal/known-orders',
  'POST /internal/purchase',
  'POST /internal/bcl-log',
  'GET /internal/email-queue',
  'POST /internal/email-queue/:id',
  'POST /internal/export',
];

/** Public /api routes (no token). */
export const PUBLIC_ROUTES = ['POST /api/register'];

/** Unrouted /api/admin paths: the prefix guard must still answer 401/403 (never 404 to a non-admin). */
export const UNROUTED_ADMIN: [string, string][] = [
  ['GET', '/api/admin/users'],
  ['PUT', '/api/admin/settings/support_wa'],
  ['DELETE', '/api/admin/users/x'],
];

export const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000';

/** A concrete path for a Hono pattern. */
export const concrete = (pattern: string, uid: string) =>
  pattern.replace(':uid', uid).replace(':orderRef', 'test_order_x').replace(':id', PLACEHOLDER_ID).replace(':table', 'items');

/** Registered routes under a prefix as "METHOD /pattern", sorted, without Hono's ALL middleware entries. */
export function routeKeys(app: { routes: { method: string; path: string }[] }, prefix: string): string[] {
  return [...new Set(app.routes.filter((r) => r.method !== 'ALL' && r.path.startsWith(prefix)).map((r) => `${r.method} ${r.path}`))].sort();
}
