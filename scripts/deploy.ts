import { network } from 'hardhat';

async function main() {
  const connection = await network.connect();
  const { viem } = connection;
  const walletClients = await viem.getWalletClients();

  if (walletClients.length === 0) {
    throw new Error('지정된 네트워크에 사용할 지갑이 없습니다. DEPLOYER_PRIVATE_KEY를 설정하세요.');
  }

  const deployer = walletClients[0];
  console.log(`Deploying ProfileRegistry with ${deployer.account.address}`);

  const contract = await viem.deployContract('ProfileRegistry');
  console.log(`ProfileRegistry deployed at ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
