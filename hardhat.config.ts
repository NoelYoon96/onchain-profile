import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import hardhatViem from '@nomicfoundation/hardhat-viem';

dotenv.config();

type Networks = NonNullable<HardhatUserConfig['networks']>;

const networks: Networks = {
  hardhat: {
    type: 'edr-simulated',
  },
};

const rpcUrl = process.env.ETH_RPC_URL ?? process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (rpcUrl) {
  networks.sepolia = {
    type: 'http',
    url: rpcUrl,
    accounts: privateKey ? [privateKey] : undefined,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './contracts/test',
    cache: './build/cache',
    artifacts: './build/artifacts',
  },
  networks,
  plugins: [hardhatViem],
};

export default config;
