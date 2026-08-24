import { createHash, randomBytes } from 'crypto';

function randomToken(byteLength = 32) {
  return randomBytes(byteLength).toString('base64url');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function generateStationApiKey() {
  const secret = randomToken(36);

  return `wm_${secret}`;
}
