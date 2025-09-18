'use client';

import { useState } from 'react';

import { ProfileCard } from '@/components/profile-card';
import type { OnchainProfile } from '@/types/profile';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const ENS_REGEX = /^[a-z0-9-]+\.[a-z]{2,}$/i;

export function ProfileLookup() {
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState<OnchainProfile | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState<string>('');
  const [ensResult, setEnsResult] = useState<{ name: string; address: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setProfile(null);
    setEnsResult(null);

    const rawInput = query.trim();
    if (rawInput.length === 0) {
      setStatus('error');
      setMessage('지갑 주소 또는 ENS 이름을 입력하세요.');
      return;
    }

    setStatus('loading');

    try {
      let target = rawInput.toLowerCase();

      if (!ADDRESS_REGEX.test(target)) {
        if (!ENS_REGEX.test(rawInput)) {
          throw new Error('지갑 주소 또는 ENS 도메인 형식으로 입력해주세요.');
        }

        const response = await fetch(`/api/ens/resolve?name=${encodeURIComponent(rawInput)}`);
        if (response.status === 404) {
          throw new Error('해당 ENS 이름으로 매핑된 주소가 없습니다.');
        }
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? 'ENS 이름을 확인하지 못했습니다.');
        }

        const data = (await response.json()) as { address: string };
        target = data.address.toLowerCase();
        setEnsResult({ name: rawInput, address: data.address });
      }

      const res = await fetch(`/api/profiles/${target}`);
      if (res.status === 404) {
        throw new Error('등록된 프로필이 없습니다.');
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? '프로필을 불러오지 못했습니다.');
      }
      const data = (await res.json()) as OnchainProfile;
      setProfile(data);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white shadow-xl shadow-black/20 backdrop-blur">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white">프로필 검색</h2>
        <p className="text-xs text-white/60">지갑 주소나 ENS 이름으로 ENS 스타일 명함을 찾아보세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="0x 주소 또는 ENS (예: vitalik.eth)"
          className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '조회 중…' : '검색'}
        </button>
      </form>

      {status === 'error' && message ? (
        <p className="text-xs text-red-300">{message}</p>
      ) : null}

      {ensResult ? (
        <p className="text-xs text-white/60">{ensResult.name} → {ensResult.address}</p>
      ) : null}

      {profile ? <ProfileCard profile={profile} title="검색 결과" /> : null}
    </section>
  );
}
