import Image from 'next/image';

import type { OnchainProfile } from '@/types/profile';

type Props = {
  profile: OnchainProfile;
  title?: string;
};

export function ProfileCard({ profile, title }: Props) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white shadow-lg shadow-black/30 backdrop-blur">
      {title ? <h3 className="text-base font-semibold text-white/90">{title}</h3> : null}
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/10">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName ?? profile.handle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/70">
              {profile.handle.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="font-mono text-xs text-white/60">{profile.address}</span>
          <span className="text-lg font-semibold">{profile.displayName || profile.handle}</span>
          <span className="text-xs text-white/70">@{profile.handle}</span>
          {profile.bio ? <p className="text-sm text-white/80">{profile.bio}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/70">
        {profile.website ? (
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 hover:border-white/40 hover:text-white"
          >
            🌐 웹사이트
          </a>
        ) : null}
        {profile.twitter ? (
          <a
            href={`https://x.com/${profile.twitter.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 hover:border-white/40 hover:text-white"
          >
            🐦 X
          </a>
        ) : null}
        {profile.telegram ? (
          <a
            href={`https://t.me/${profile.telegram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 hover:border-white/40 hover:text-white"
          >
            ✈️ 텔레그램
          </a>
        ) : null}
      </div>
    </article>
  );
}
