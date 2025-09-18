import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: '프로필 저장은 온체인 트랜잭션으로 처리됩니다. 지갑에서 직접 컨트랙트를 호출하세요.',
    },
    { status: 405 },
  );
}
