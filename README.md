# Onchain Profile MVP

ENS 스타일 온체인 명함을 빠르게 실험할 수 있는 Next.js 기반 MVP입니다. 지갑으로 서명한 프로필을 등록하고 ENS 주소/이더리움 주소로 다른 사용자를 탐색할 수 있습니다.

## 주요 기능
- **지갑 연결 & 상태 표시**: wagmi + React Query 기반으로 메타마스크 등 인젝션 지갑을 연결하고 ENS 이름을 자동으로 표시합니다.
- **서명 기반 프로필 발행**: 프로필을 저장할 때 지갑에서 메시지 서명을 생성하여 서버가 작성자 주소를 검증합니다. 5분 이내 서명만 허용해 재사용 공격을 방지합니다.
- **ENS/주소 검색**: 0x 주소뿐 아니라 `vitalik.eth` 같은 ENS 이름도 조회해 프로필을 불러옵니다.
- **스토리지 추상화**: 현재는 파일(`data/profiles.json`)에 저장하지만, 저장소 인터페이스를 통해 스마트컨트랙트 등 다른 백엔드로 쉽게 교체할 수 있습니다.

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

배포 후 반환된 컨트랙트 주소를 `.env.local`의 `NEXT_PUBLIC_PROFILE_CONTRACT`에 기록해 두면 추후 온체인 연동 작업에서 재사용할 수 있습니다.

## 개발 메모
- 프로필 저장 시 지갑에서 서명한 `OnchainProfile:{address}:{signedAt}:{hash}` 메시지를 전송합니다. 서버는 `viem`을 사용해 서명을 복구하고, 5분 내 요청인지 확인한 뒤 데이터를 저장합니다.
- ENS 해석은 Cloudflare 메인넷 엔드포인트를 사용하는 `viem` public client로 처리합니다. 프로덕션에서는 전용 RPC나 캐시 계층을 붙이는 것을 권장합니다.
- 파일 스토리지 구현은 `src/server/profile-repository.ts`에서 추상화되어 있습니다. 동일한 인터페이스로 온체인 컨트랙트 연동 버전을 구현할 수 있습니다.
- 모든 프로필에는 `version` 필드가 포함되며 현재 스키마 버전은 `PROFILE_SCHEMA_VERSION`(`src/lib/validation.ts`)에서 관리됩니다.

## 다음 단계 아이디어
1. 파일 스토리지를 스마트컨트랙트 호출로 교체하고, 조회 역시 온체인 인덱서/그래프 서비스를 활용합니다.
2. 프로필 레코드에 소셜 그래프(팔로우, 추천인) 정보를 추가하여 확장합니다.
3. ENS 아바타, Lens/Primary ENS 등과 연동하여 더 풍부한 온체인 아이덴티티를 구성합니다.
