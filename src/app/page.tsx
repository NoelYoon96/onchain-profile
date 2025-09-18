import type { OnchainProfile } from '@/types/profile';

import { ProfileForm } from '@/components/profile-form';
import { ProfileLookup } from '@/components/profile-lookup';
import { ProfileCard } from '@/components/profile-card';
import { WalletStatus } from '@/components/wallet-status';

const sampleProfile: OnchainProfile = {
  address: '0x1234...abcd',
  handle: 'builder',
  displayName: 'Builder Kim',
  bio: 'DeSoc와 온체인 커뮤니티를 만드는 프로덕트 빌더.',
  website: 'https://example.xyz',
  twitter: '@onchainbuilder',
  telegram: '@builderdao',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-indigo-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-8">
        <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/40 p-10 text-left shadow-2xl shadow-black/50 backdrop-blur">
          <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
            온체인 아이덴티티 MVP
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            ENS 스타일 온체인 명함으로
            <br />
            나의 웹3 네트워크를 시작하세요.
          </h1>
          <p className="max-w-2xl text-base text-white/70 sm:text-lg">
            지갑을 연결하고 온체인에 나만의 명함을 발행해 보세요. 다른 사용자는 지갑 주소만으로 당신의 링크와 소셜 그래프를 탐색할 수 있습니다.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <WalletStatus />
            <ProfileCard profile={sampleProfile} title="샘플 명함" />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <ProfileForm />
          <ProfileLookup />
        </section>
      </div>
    </main>
  );
}
