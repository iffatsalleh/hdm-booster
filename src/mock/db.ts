// DEV MOCK ONLY. Accounts + signed-in uid kept in localStorage so a reload keeps the session (like Firebase).
import { ALI, type MockAccount } from './fixtures';

const K_ACCOUNTS = 'hdm_mock_accounts';
const K_UID = 'hdm_mock_uid';

function read<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    if (v == null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* private mode: in-memory only */
  }
}

let accounts: MockAccount[] = read(K_ACCOUNTS, [ALI]);
let uid: string | null = read<string | null>(K_UID, null);

export const db = {
  accounts: () => accounts,
  byEmail: (email: string) => accounts.find((a) => a.email === email) ?? null,
  current: () => accounts.find((a) => a.uid === uid) ?? null,
  add(a: MockAccount) {
    accounts = [...accounts, a];
    write(K_ACCOUNTS, accounts);
  },
  setUid(v: string | null) {
    uid = v;
    write(K_UID, v);
  },
};

export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export function authError(code: string): Error {
  return Object.assign(new Error(code), { code });
}
