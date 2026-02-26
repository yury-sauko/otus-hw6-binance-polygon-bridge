import { configVariable, defineConfig } from 'hardhat/config';
import hardhatVerify from '@nomicfoundation/hardhat-verify';
import 'dotenv/config';

export default defineConfig({
  plugins: [hardhatVerify],
  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
      },
      production: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    bscTestnet: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('BSC_TESTNET_RPC_URL'),
      accounts: [configVariable('BSC_TESTNET_PRIVATE_KEY')],
    },
    polygonAmoy: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('POLYGON_AMOY_RPC_URL'),
      accounts: [configVariable('POLYGON_AMOY_PRIVATE_KEY')],
    },
  },
  chainDescriptors: {
    97: {
      name: 'BNB Smart Chain Testnet',
      blockExplorers: {
        etherscan: {
          name: 'BscScan',
          url: 'https://testnet.bscscan.com',
          apiUrl: 'https://api.etherscan.io/v2/api',
        },
      },
    },
    80002: {
      name: 'Polygon Amoy Testnet',
      blockExplorers: {
        etherscan: {
          name: 'PolygonScan',
          url: 'https://amoy.polygonscan.com',
          apiUrl: 'https://api.etherscan.io/v2/api',
        },
      },
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable('ETHERSCAN_API_KEY'),
    },
  },
});
