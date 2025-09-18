import { profileContractConfig } from '@/lib/contracts/profile';
import { profileRegistryAbi } from '@/contracts/profile-registry';
import type { OnchainProfile } from '@/types/profile';

import { getPublicClient } from '@/server/viem-client';

type RawContractProfile = {
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  website: string;
  twitter: string;
  telegram: string;
  updatedAt: bigint;
};

function normalizeProfile(address: string, raw: {
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  website: string;
  twitter: string;
  telegram: string;
  updatedAt: bigint;
}): OnchainProfile | null {
  const hasProfile = raw.handle.length > 0 || raw.updatedAt > 0n;
  if (!hasProfile) {
    return null;
  }

  const toOptional = (value: string) => (value && value.length > 0 ? value : undefined);

  return {
    address,
    handle: raw.handle,
    displayName: toOptional(raw.displayName),
    bio: toOptional(raw.bio),
    avatarUrl: toOptional(raw.avatarUrl),
    website: toOptional(raw.website),
    twitter: toOptional(raw.twitter),
    telegram: toOptional(raw.telegram),
    updatedAt: Number(raw.updatedAt),
  };
}

async function fetchProfile(address: string): Promise<OnchainProfile | null> {
  if (!profileContractConfig) {
    return null;
  }

  const client = getPublicClient();
  const result = (await client.readContract({
    address: profileContractConfig.address,
    abi: profileRegistryAbi,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
  })) as RawContractProfile;

  return normalizeProfile(address, result);
}

export interface ProfileRepository {
  get(address: string): Promise<OnchainProfile | null>;
}

export const profileRepository: ProfileRepository = {
  get(address) {
    return fetchProfile(address);
  },
};

export type { OnchainProfile };
