import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: z.coerce
    .number({ invalid_type_error: '체인 ID는 숫자여야 합니다.' })
    .int()
    .positive()
    .default(1),
  NEXT_PUBLIC_PROFILE_CONTRACT: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  NEXT_PUBLIC_RPC_URL: z.string().url().optional(),
});

const parsed = clientEnvSchema.parse({
  NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
  NEXT_PUBLIC_PROFILE_CONTRACT: process.env.NEXT_PUBLIC_PROFILE_CONTRACT,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
});

export const clientEnv = {
  defaultChainId: parsed.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
  profileContractAddress: parsed.NEXT_PUBLIC_PROFILE_CONTRACT,
  rpcUrl: parsed.NEXT_PUBLIC_RPC_URL,
};
