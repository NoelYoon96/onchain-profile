import { NextResponse } from 'next/server';
import { isAddress, getAddress } from 'viem';

import { resolveEnsName } from '@/server/ens';
import { getClientIdentifier } from '@/server/http';
import { rateLimit } from '@/server/rate-limit';

export async function GET(request: Request) {
  const clientId = getClientIdentifier(request);
  const limit = rateLimit({ key: `ens:resolve:${clientId}`, max: 20 });
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

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'ENS 이름을 입력하세요.' }, { status: 400 });
  }

  try {
    const address = await resolveEnsName(name.toLowerCase());
    if (!address) {
      return NextResponse.json({ error: '해당 ENS 이름과 매칭되는 주소가 없습니다.' }, { status: 404 });
    }

    if (!isAddress(address)) {
      return NextResponse.json({ error: 'ENS 해석 결과가 올바르지 않습니다.' }, { status: 502 });
    }

    return NextResponse.json({ address: getAddress(address) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ENS 이름을 확인하지 못했습니다.' },
      { status: 500 },
    );
  }
}
