import { http, createConfig } from 'wagmi';
import { type Chain, base, mainnet, optimism, polygon } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

import { clientEnv } from '@/lib/env';

const supportedChains: Chain[] = [mainnet, base, optimism, polygon];

const chainMap = new Map(supportedChains.map((chain) => [chain.id, chain]));
const defaultChain = chainMap.get(clientEnv.defaultChainId) ?? mainnet;
const orderedChains = [defaultChain, ...supportedChains.filter((chain) => chain.id !== defaultChain.id)];

const transports = orderedChains.reduce<Record<number, ReturnType<typeof http>>>(
  (acc, chain) => {
    acc[chain.id] = http(clientEnv.rpcUrl ? clientEnv.rpcUrl : undefined);
    return acc;
  },
  {},
);

export const config = createConfig({
  chains: orderedChains,
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected({
      target: 'walletConnect',
    }),
    injected(),
  ],
  transports,
  ssr: true,
});
