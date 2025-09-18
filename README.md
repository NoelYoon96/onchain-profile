# Onchain Profile MVP

ENS 스타일 온체인 명함을 빠르게 실험할 수 있는 Next.js 기반 MVP입니다. 지갑으로 서명한 프로필을 등록하고 ENS 주소/이더리움 주소로 다른 사용자를 탐색할 수 있습니다.

## 주요 기능
- **지갑 연결 & 상태 표시**: wagmi 기반으로 메타마스크 등 인젝션 지갑을 연결하고 ENS 이름을 자동으로 표시합니다.
- **온체인 프로필 발행**: 사용자가 지갑에서 직접 `ProfileRegistry` 컨트랙트에 트랜잭션을 전송해 프로필을 갱신합니다.
- **ENS/주소 검색**: 0x 주소뿐 아니라 `vitalik.eth` 같은 ENS 이름도 조회해 프로필을 불러옵니다.
- **온체인 ProfileRegistry**: Hardhat으로 배포한 컨트랙트에 직접 쓰고 읽습니다. 프런트는 wagmi `writeContract`로 트랜잭션을 발생시키고, 서버 API는 조회를 위해 컨트랙트를 호출합니다.

## 빠른 시작
```bash
cp .env.local.example .env.local # 필요 시 환경변수 설정
pnpm install
pnpm dev
```

`.env.local`에서 기본 체인과 프로필 컨트랙트 주소를 지정할 수 있습니다.

- `NEXT_PUBLIC_DEFAULT_CHAIN_ID` (기본값 1)
- `NEXT_PUBLIC_RPC_URL` (선택, 지정 시 모든 체인 호출에 사용)
- `NEXT_PUBLIC_PROFILE_CONTRACT` (선택, 0x 주소)

로컬에서 [http://localhost:3000](http://localhost:3000)에 접속한 뒤 지갑을 연결하면 프로필 발행과 조회를 바로 테스트할 수 있습니다.

### 유용한 스크립트
- `pnpm lint` – ESLint 검사
- `pnpm test` – 서명 검증 단위 테스트(Vitest)
- `pnpm contracts:compile` – Solidity 컨트랙트 컴파일
- `pnpm contracts:deploy` – Hardhat 로컬 네트워크에 배포
- `pnpm contracts:deploy:sepolia` – 환경변수 기반으로 Sepolia 등에 배포(네트워크 플래그 변경 가능)

## 스마트 컨트랙트 배포
1. `.env.hardhat.example`를 `.env`로 복사하고 개인 RPC/프라이빗키를 설정하세요.

   ```bash
   cp .env.hardhat.example .env
   ```

   - `ETH_RPC_URL` 혹은 `SEPOLIA_RPC_URL`: 배포할 체인의 RPC 엔드포인트
   - `DEPLOYER_PRIVATE_KEY`: 배포에 사용할 지갑의 프라이빗 키(0x로 시작)

2. 컨트랙트를 컴파일합니다.

   ```bash
   pnpm contracts:compile
   ```

3. 원하는 네트워크로 배포합니다. 예시는 Sepolia입니다.

   ```bash
   pnpm contracts:deploy:sepolia
   ```

   `--network` 플래그를 바꿔 다른 네트워크도 지정할 수 있습니다.

배포 후 반환된 컨트랙트 주소를 `.env.local`의 `NEXT_PUBLIC_PROFILE_CONTRACT`에 기록하면 프런트엔드가 해당 온체인 데이터를 바로 사용합니다.

## 개발 메모
- `ProfileRegistry` 컨트랙트의 `upsertProfile`을 호출해 데이터를 저장합니다. 저장 구조는 `contracts/ProfileRegistry.sol`에서 확인할 수 있습니다.
- ENS 해석은 Cloudflare 메인넷 엔드포인트를 사용하는 `viem` public client로 처리합니다. 프로덕션에서는 전용 RPC나 캐시 계층을 붙이는 것을 권장합니다.
- `src/server/profile-repository.ts`는 viem public client를 사용해 컨트랙트에서 프로필을 조회합니다.
- 모든 프로필에는 `version` 필드가 포함되며 현재 스키마 버전은 `PROFILE_SCHEMA_VERSION`(`src/lib/validation.ts`)에서 관리됩니다.

## 다음 단계 아이디어
1. 컨트랙트 이벤트를 인덱싱하거나 The Graph/Supabase 등을 붙여 조회를 캐싱하면 검색 성능을 높일 수 있습니다.
2. 프로필 레코드에 소셜 그래프(팔로우, 추천인) 정보를 추가하여 확장합니다.
3. ENS 아바타, Lens/Primary ENS 등과 연동하여 더 풍부한 온체인 아이덴티티를 구성합니다.
