'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { profileRegistryAbi } from '@/contracts/profile-registry';
import { profileContractConfig, profileContractAddress } from '@/lib/contracts/profile';
import { normalizeProfileInput, profileSchema, type ProfileInput } from '@/lib/validation';

const emptyForm: ProfileInput = {
  address: '',
  handle: '',
  displayName: '',
  bio: '',
  avatarUrl: '',
  website: '',
  twitter: '',
  telegram: '',
};

type FormState = typeof emptyForm;

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

export function ProfileForm() {
  const { address, isConnected } = useAccount();
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>(undefined);

  const lowercaseAddress = useMemo(() => address?.toLowerCase() ?? '', [address]);

  const contractAddressForRead = profileContractConfig?.address ??
    '0x0000000000000000000000000000000000000000';
  const profileArgs = lowercaseAddress
    ? ([lowercaseAddress as `0x${string}`] as const)
    : undefined;

  const { data: contractProfile, refetch } = useReadContract({
    address: contractAddressForRead,
    abi: profileRegistryAbi,
    functionName: 'getProfile',
    args: profileArgs,
    query: {
      enabled: Boolean(profileContractConfig && lowercaseAddress),
    },
  });

  const { writeContractAsync, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: pendingHash,
  });

  useEffect(() => {
    if (!lowercaseAddress) {
      setFormState(emptyForm);
      return;
    }
    setFormState((prev) => ({ ...prev, address: lowercaseAddress }));
  }, [lowercaseAddress]);

  useEffect(() => {
    if (!contractProfile) {
      if (contractProfile === null) {
        setFormState({ ...emptyForm, address: lowercaseAddress });
      }
      return;
    }

    const raw = contractProfile as RawContractProfile;
    if (raw.handle.length === 0 && raw.updatedAt === 0n) {
      setFormState({ ...emptyForm, address: lowercaseAddress });
      return;
    }

    const optional = (value: string) => (value && value.length > 0 ? value : '');

    setFormState({
      address: lowercaseAddress,
      handle: raw.handle ?? '',
      displayName: optional(raw.displayName),
      bio: optional(raw.bio),
      avatarUrl: optional(raw.avatarUrl),
      website: optional(raw.website),
      twitter: optional(raw.twitter),
      telegram: optional(raw.telegram),
    });
  }, [contractProfile, lowercaseAddress]);

  useEffect(() => {
    if (txConfirmed) {
      setFeedback({ type: 'success', message: '온체인 명함이 업데이트되었습니다.' });
      refetch();
    }
  }, [txConfirmed, refetch]);

  useEffect(() => {
    if (writeError) {
      setFeedback({ type: 'error', message: writeError.message });
    }
  }, [writeError]);

  if (!isConnected || !lowercaseAddress) {
    return null;
  }

  if (!profileContractAddress) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-red-300">
        컨트랙트 주소가 설정되어 있지 않습니다. `NEXT_PUBLIC_PROFILE_CONTRACT` 환경 변수를 확인하세요.
      </div>
    );
  }

  const handleChange = (field: keyof FormState, value: string) => {
    setFeedback(null);
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const validated = profileSchema.safeParse({ ...formState, address: lowercaseAddress });
    if (!validated.success) {
      const message = validated.error.issues.map((issue) => issue.message).join('\n');
      setFeedback({ type: 'error', message });
      return;
    }

    const normalized = normalizeProfileInput(validated.data);

    try {
      const profileStruct = {
        handle: normalized.handle,
        displayName: normalized.displayName ?? '',
        bio: normalized.bio ?? '',
        avatarUrl: normalized.avatarUrl ?? '',
        website: normalized.website ?? '',
        twitter: normalized.twitter ?? '',
        telegram: normalized.telegram ?? '',
        updatedAt: 0n,
      } as const;

      const hash = await writeContractAsync({
        address: profileContractAddress,
        abi: profileRegistryAbi,
        functionName: 'upsertProfile',
        args: [profileStruct],
      });

      setPendingHash(hash);
      setFeedback({ type: 'success', message: '트랜잭션이 제출되었습니다. 확인 중…' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '트랜잭션 전송에 실패했습니다.';
      setFeedback({ type: 'error', message });
    }
  };

  const isBusy = isWriting || isConfirming;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm shadow-xl shadow-black/20 backdrop-blur"
    >
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white">온체인 명함 발행</h2>
        <p className="text-xs text-white/60">
          닉네임과 링크를 등록하면 다른 사용자가 지갑 주소로 당신을 찾을 수 있어요.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/60">핸들 (예: yourname)</span>
          <input
            required
            value={formState.handle}
            onChange={(event) => handleChange('handle', event.target.value)}
            placeholder="소문자, 숫자, 하이픈 조합"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/60">표시 이름</span>
          <input
            value={formState.displayName ?? ''}
            onChange={(event) => handleChange('displayName', event.target.value)}
            placeholder="홍길동"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-white/60">소개</span>
          <textarea
            value={formState.bio ?? ''}
            onChange={(event) => handleChange('bio', event.target.value)}
            placeholder="나를 한 줄로 소개해 보세요"
            rows={3}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/60">프로필 이미지 URL</span>
          <input
            value={formState.avatarUrl ?? ''}
            onChange={(event) => handleChange('avatarUrl', event.target.value)}
            placeholder="https://"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/60">웹사이트</span>
          <input
            value={formState.website ?? ''}
            onChange={(event) => handleChange('website', event.target.value)}
            placeholder="https://example.xyz"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/60">X (Twitter) 핸들</span>
          <input
            value={formState.twitter ?? ''}
            onChange={(event) => handleChange('twitter', event.target.value)}
            placeholder="@id"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/60">텔레그램</span>
          <input
            value={formState.telegram ?? ''}
            onChange={(event) => handleChange('telegram', event.target.value)}
            placeholder="@id"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isBusy}
        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isConfirming ? '확인 중…' : isWriting ? '트랜잭션 전송 중…' : '온체인 명함 저장하기'}
      </button>

      {feedback ? (
        <p
          className={`text-xs ${feedback.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
