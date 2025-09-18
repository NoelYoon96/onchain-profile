import { getAddress } from 'viem';

import { clientEnv } from '@/lib/env';
import { profileRegistryAbi } from '@/contracts/profile-registry';

export const profileContractAddress = clientEnv.profileContractAddress
  ? getAddress(clientEnv.profileContractAddress)
  : undefined;

export const profileContractConfig = profileContractAddress
  ? {
      address: profileContractAddress,
      abi: profileRegistryAbi,
    }
  : null;
