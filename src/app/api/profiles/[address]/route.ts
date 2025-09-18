import { NextResponse } from 'next/server';

import { profileRepository } from '@/server/profile-repository';
import { getClientIdentifier } from '@/server/http';
import { rateLimit } from '@/server/rate-limit';

export async function GET(
  _request: Request,
  { params }: { params: { address: string } },
) {
  const clientId = getClientIdentifier(_request);
  const limit = rateLimit({ key: `profiles:get:${clientId}`, max: 20 });
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
        },
      },
    );
  }

  const { address } = params;
  const normalized = address.toLowerCase();

  if (!/^0x[a-f0-9]{40}$/i.test(normalized)) {
    return NextResponse.json(
      { error: '유효한 이더리움 주소가 아닙니다.' },
      { status: 400 },
    );
  }

  const profile = await profileRepository.get(normalized);

  if (!profile) {
    return NextResponse.json(
      { error: '등록된 프로필이 없습니다.' },
      { status: 404 },
    );
  }

  return NextResponse.json(profile, { status: 200 });
}
