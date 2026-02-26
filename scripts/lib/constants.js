import 'dotenv/config';

export const TOKEN_NAME = 'Bridge Token BscPol';
export const TOKEN_SYMBOL = 'BTBP';
export const INITIAL_SUPPLY = '1000000000000000000000000'; // 1M * 10^18

export const NETWORKS_CONFIG = {
  bscTestnet: {
    chainId: 97,
    rpc: process.env.BSC_TESTNET_RPC_URL,
    privateKey: process.env.BSC_TESTNET_PRIVATE_KEY,
    tokenAddress: process.env.DEPLOYED_TOKEN_BSC_ADDRESS,
    name: 'BSC Testnet',
    nativeSymbol: 'tBNB',
  },
  polygonAmoy: {
    chainId: 80002,
    rpc: process.env.POLYGON_AMOY_RPC_URL,
    privateKey: process.env.POLYGON_AMOY_PRIVATE_KEY,
    tokenAddress: process.env.DEPLOYED_TOKEN_POLYGON_ADDRESS,
    name: 'Polygon Amoy',
    nativeSymbol: 'POL',
  },
};
