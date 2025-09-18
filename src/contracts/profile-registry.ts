import type { Abi } from 'viem';

export const profileRegistryAbi = [
  {
    inputs: [
      {
        components: [
          { internalType: 'string', name: 'handle', type: 'string' },
          { internalType: 'string', name: 'displayName', type: 'string' },
          { internalType: 'string', name: 'bio', type: 'string' },
          { internalType: 'string', name: 'avatarUrl', type: 'string' },
          { internalType: 'string', name: 'website', type: 'string' },
          { internalType: 'string', name: 'twitter', type: 'string' },
          { internalType: 'string', name: 'telegram', type: 'string' },
          { internalType: 'uint64', name: 'updatedAt', type: 'uint64' },
        ],
        internalType: 'struct ProfileRegistry.Profile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    name: 'upsertProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'getProfile',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'handle', type: 'string' },
          { internalType: 'string', name: 'displayName', type: 'string' },
          { internalType: 'string', name: 'bio', type: 'string' },
          { internalType: 'string', name: 'avatarUrl', type: 'string' },
          { internalType: 'string', name: 'website', type: 'string' },
          { internalType: 'string', name: 'twitter', type: 'string' },
          { internalType: 'string', name: 'telegram', type: 'string' },
          { internalType: 'uint64', name: 'updatedAt', type: 'uint64' },
        ],
        internalType: 'struct ProfileRegistry.Profile',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'handle', type: 'string' }],
    name: 'handleOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'string', name: 'handle', type: 'string' },
      { indexed: false, internalType: 'string', name: 'displayName', type: 'string' },
      { indexed: false, internalType: 'string', name: 'bio', type: 'string' },
      { indexed: false, internalType: 'string', name: 'avatarUrl', type: 'string' },
      { indexed: false, internalType: 'string', name: 'website', type: 'string' },
      { indexed: false, internalType: 'string', name: 'twitter', type: 'string' },
      { indexed: false, internalType: 'string', name: 'telegram', type: 'string' },
      { indexed: false, internalType: 'uint64', name: 'updatedAt', type: 'uint64' },
    ],
    name: 'ProfileUpserted',
    type: 'event',
  },
] as const satisfies Abi;

export type ProfileRegistryAbi = typeof profileRegistryAbi;
