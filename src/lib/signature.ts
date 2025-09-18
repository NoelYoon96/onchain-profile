import { keccak256, stringToHex } from 'viem';

import type { ProfilePayload } from '@/lib/validation';

const SIGNATURE_PREFIX = 'OnchainProfile';

export function createProfileSigningMessage(
  payload: ProfilePayload,
  signedAt: string,
): string {
  const canonical = JSON.stringify(payload);
  const hash = keccak256(stringToHex(canonical));
  return `${SIGNATURE_PREFIX}:${payload.address}:${signedAt}:${hash}`;
}
