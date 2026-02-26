import { artifacts } from 'hardhat';
import { Web3 } from 'web3';

import { NETWORKS_CONFIG } from './lib/constants.js';

/**
 * Скрипт взаимодействия с TokenBscPol в BSC Testnet и Polygon Amoy.
 * Показывает балансы и информацию о токене в обеих сетях.
 */

const { bscTestnet: bsc, polygonAmoy: polygon } = NETWORKS_CONFIG;

if (!bsc.privateKey && !polygon.privateKey) {
  console.error('Ошибка: установите BSC_TESTNET_PRIVATE_KEY и POLYGON_AMOY_PRIVATE_KEY в .env');
  process.exit(1);
}

const getFormattedNumber = (value) => Number(value).toLocaleString('ru-RU');

async function getTokenInfo(web3, tokenAddress, accountAddress, tokenAbi, networkName) {
  if (!tokenAddress) return null;

  const contract = new web3.eth.Contract(tokenAbi, tokenAddress);
  const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
    contract.methods.name().call(),
    contract.methods.symbol().call(),
    contract.methods.decimals().call(),
    contract.methods.totalSupply().call(),
    contract.methods.balanceOf(accountAddress).call(),
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply,
    balance,
    networkName,
  };
}

async function getBalance(web3, address, nativeSymbol) {
  const balance = await web3.eth.getBalance(address);
  return { wei: balance, formatted: web3.utils.fromWei(balance, 'ether'), nativeSymbol };
}

const main = async () => {
  console.log('=== Web3.js Взаимодействие с TokenBscPol ===\n');

  const artifact = await artifacts.readArtifact('TokenBscPol');
  const tokenAbi = artifact.abi;

  const privateKey = bsc.privateKey || polygon.privateKey;
  const pk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const web3Any = new Web3(bsc.rpc || polygon.rpc);
  const account = web3Any.eth.accounts.privateKeyToAccount(pk);

  for (const network of Object.values(NETWORKS_CONFIG)) {
    if (!network.rpc || !network.tokenAddress) continue;

    const web3 = new Web3(network.rpc);
    console.log(`\n--- ${network.name} ---`);

    try {
      const gasPrice = await web3.eth.getGasPrice();
      console.log('Gas Price:', web3.utils.fromWei(gasPrice, 'gwei'), 'Gwei');

      const nativeBal = await getBalance(web3, account.address, network.nativeSymbol);
      console.log(`Баланс ${network.nativeSymbol}:`, nativeBal.formatted);

      const tokenInfo = await getTokenInfo(
        web3,
        network.tokenAddress,
        account.address,
        tokenAbi,
        network.name,
      );
      if (tokenInfo) {
        console.log('Токен:', tokenInfo.symbol);
        console.log(
          'Total Supply:',
          getFormattedNumber(web3.utils.fromWei(tokenInfo.totalSupply, 'ether')),
        );
        console.log(
          'Баланс токенов:',
          getFormattedNumber(web3.utils.fromWei(tokenInfo.balance, 'ether')),
        );
      }
    } catch (err) {
      console.error(`Ошибка ${network.name}:`, err.message);
    }
  }

  console.log('\n=== Завершено ===');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
