import { describe, expect, it } from 'vitest';
import { recoverMessageAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { createProfileSigningMessage } from '../signature';
import { PROFILE_SCHEMA_VERSION, type ProfilePayload } from '../validation';

const account = privateKeyToAccount(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b7d3d3c02',
);

describe('createProfileSigningMessage', () => {
  it('produces deterministic hash-based message and recovers signer address', async () => {
    const payload: ProfilePayload = {
      version: PROFILE_SCHEMA_VERSION,
      address: account.address,
      handle: 'builder',
      displayName: 'Builder Kim',
      bio: '테스트 설명',
      twitter: 'builder',
    };
    const signedAt = new Date('2024-01-01T00:00:00.000Z').toISOString();

    const message = createProfileSigningMessage(payload, signedAt);
    const secondMessage = createProfileSigningMessage(payload, signedAt);
    expect(message).toBe(secondMessage);

    const signature = await account.signMessage({ message });
    const recovered = await recoverMessageAddress({ message, signature });

    expect(recovered.toLowerCase()).toBe(account.address.toLowerCase());
  });
});
