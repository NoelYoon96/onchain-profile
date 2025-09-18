import { createPublicClient, http } from 'viem';
import { base, mainnet, optimism, polygon } from 'viem/chains';

import { clientEnv } from '@/lib/env';

const chainMap = new Map(
  [mainnet, base, optimism, polygon].map((chain) => [chain.id, chain]),
);

const selectedChain = chainMap.get(clientEnv.defaultChainId) ?? mainnet;

const transport = clientEnv.rpcUrl ? http(clientEnv.rpcUrl) : http();

let cachedClient: ReturnType<typeof createPublicClient> | null = null;

export function getPublicClient() {
  if (!cachedClient) {
    cachedClient = createPublicClient({
      chain: selectedChain,
      transport,
    });
  }
  return cachedClient;
}
