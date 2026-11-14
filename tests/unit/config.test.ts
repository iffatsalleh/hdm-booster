import { describe, it, expect } from 'vitest';
import { resolveConfig } from '../../src/lib/config';

const env = {
  VITE_FIREBASE_API_KEY: 'k-env',
  VITE_FIREBASE_AUTH_DOMAIN: 'd-env.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'p-env',
  VITE_API_URL: 'http://localhost:8787/',
  VITE_GAS_URL: 'https://script.google.com/macros/s/x/exec',
};

describe('resolveConfig', () => {
  it('reads Vite env when window.HDM_CONFIG is absent', () => {
    expect(resolveConfig({}, env)).toEqual({
      firebase: { apiKey: 'k-env', authDomain: 'd-env.firebaseapp.com', projectId: 'p-env' },
      apiUrl: 'http://localhost:8787',
      gasUrl: 'https://script.google.com/macros/s/x/exec',
    });
  });

  it('prefers window.HDM_CONFIG over env (whole object, not merged)', () => {
    const win = {
      HDM_CONFIG: {
        firebase: { apiKey: 'k-win', authDomain: 'd-win', projectId: 'p-win' },
        apiUrl: 'https://api.example.com//',
        gasUrl: 'https://gas.example.com',
      },
    };
    expect(resolveConfig(win, env)).toEqual({
      firebase: { apiKey: 'k-win', authDomain: 'd-win', projectId: 'p-win' },
      apiUrl: 'https://api.example.com',
      gasUrl: 'https://gas.example.com',
    });
  });

  it('missing values become empty strings, never undefined', () => {
    expect(resolveConfig(undefined, {})).toEqual({
      firebase: { apiKey: '', authDomain: '', projectId: '' },
      apiUrl: '',
      gasUrl: '',
    });
    expect(resolveConfig({ HDM_CONFIG: { apiUrl: 'https://a' } }, env).firebase.apiKey).toBe('');
  });
});
