import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function getEnsClient() {
  return ensClient;
}

export async function resolveEnsName(name: string) {
  return ensClient.getEnsAddress({ name });
}

export async function reverseResolveEns(address: `0x${string}`) {
  return ensClient.getEnsName({ address });
}

export async function getEnsAvatar(name: string) {
  return ensClient.getEnsAvatar({ name });
}
