// DEV MOCK ONLY: answers the Worker routes this task uses, with the Worker's reasons and BM messages.
import { ApiError } from '../lib/errors';
import { normalizeEmail, normalizePhone } from '../lib/phone';
import { bootstrapFor, UNCLAIMED_PURCHASE } from './fixtures';
import { db, delay } from './db';

const fail = (status: number, reason: string, message = ''): never => {
  throw new ApiError(reason, message, status);
};

export async function mockApi<T>(method: string, path: string, body?: unknown): Promise<T> {
  await delay();
  const key = `${method} ${path}`;

  if (key === 'POST /api/register') {
    const b = (body ?? {}) as Record<string, unknown>;
    const email = normalizeEmail(String(b.email ?? ''));
    const phone = normalizePhone(String(b.phone ?? ''));
    const name = String(b.name ?? '').trim().replace(/\s+/g, ' ');
    const password = String(b.password ?? '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'data_tidak_sah', 'Emel tidak sah.');
    if (!phone) fail(400, 'data_tidak_sah', 'Nombor telefon tidak sah. Contoh: 0123456789.');
    if (!name) fail(400, 'data_tidak_sah', 'Sila masukkan nama penuh (maksimum 100 aksara).');
    if (password.length < 8) fail(400, 'data_tidak_sah', 'Kata laluan mesti sekurang-kurangnya 8 aksara.');
    if (b.privacyAck !== true) fail(400, 'data_tidak_sah', 'Sila tandakan pengakuan privasi untuk meneruskan.');
    if (db.byEmail(email)) {
      fail(409, 'sudah_didaftar', 'Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.');
    }
    if (email !== UNCLAIMED_PURCHASE.email || phone !== UNCLAIMED_PURCHASE.phone) {
      fail(400, 'tiada_pembelian',
        'Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.');
    }
    db.add({
      uid: `mock-${Date.now()}`, email, password, full_name: name, phone: phone!, onboarded_at: null, roles: [],
      entitlements: UNCLAIMED_PURCHASE.entitlements,
    });
    return { entitlements: UNCLAIMED_PURCHASE.entitlements } as T;
  }

  const me = db.current();
  if (!me) return fail(401, 'perlu_log_masuk', 'Sila log masuk semula.');
  if (key === 'GET /api/me') {
    const { profile, ...rest } = bootstrapFor(me);
    return { profile, ...rest } as T;
  }
  return fail(404, 'tiada', 'Halaman atau tindakan tidak dijumpai.');
}
