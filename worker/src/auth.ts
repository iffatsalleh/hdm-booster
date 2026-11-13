import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Deps } from './types';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

/** Verifies a Firebase ID token (RS256, issuer/audience pinned to the project). JWKS is cached by jose. */
export function firebaseVerifier(projectId: string): Deps['verifyToken'] {
  const jwks = createRemoteJWKSet(new URL(JWKS_URL));
  return async (tok) => {
    try {
      const { payload } = await jwtVerify(tok, jwks, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
        algorithms: ['RS256'],
      });
      if (typeof payload.sub !== 'string' || !payload.sub) return null;
      return { uid: payload.sub, email: typeof payload.email === 'string' ? payload.email : '' };
    } catch {
      return null;
    }
  };
}
