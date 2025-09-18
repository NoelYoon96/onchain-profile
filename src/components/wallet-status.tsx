'use client';

import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';

export function WalletStatus() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, status: connectStatus, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: {
      enabled: Boolean(address),
    },
  });

  const primaryConnector = useMemo(
    () => connectors.find((connector) => connector.id === 'metaMask') ?? connectors[0],
    [connectors],
  );

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur">
        <div className="font-medium">지갑이 연결되었습니다.</div>
        <div className="flex flex-col gap-0.5">
          {ensName ? <div className="text-sm font-medium text-white">{ensName}</div> : null}
          <div className="font-mono text-xs text-white/80">{address}</div>
        </div>
        {chain?.name ? (
          <div className="text-xs text-white/70">네트워크: {chain.name}</div>
        ) : null}
        <button
          onClick={() => disconnect()}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
        >
          연결 해제
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm backdrop-blur">
      <p className="text-white/80">먼저 지갑을 연결하고 프로필을 발행하세요.</p>
      <button
        disabled={!primaryConnector || connectStatus === 'connecting'}
        onClick={() => primaryConnector && connect({ connector: primaryConnector })}
        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {connectStatus === 'connecting' ? '연결 중…' : '지갑 연결하기'}
      </button>
      {error ? <p className="text-xs text-red-300">{error.message}</p> : null}
    </div>
  );
}
