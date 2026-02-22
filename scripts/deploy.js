import { Web3 } from 'web3';
import { artifacts } from 'hardhat';
import 'dotenv/config';

/**
 * Скрипт деплоя контракта TokenBSC в BNB Smart Chain Testnet.
 * Использует Web3.js.
 *
 * Перед запуском: pnpm compile
 * Запуск: pnpm deploy:bsc
 */
async function main() {
  const RPC_URL = process.env.BSC_TESTNET_RPC_URL;
  const PRIVATE_KEY = process.env.BSC_TESTNET_PRIVATE_KEY;

  if (!RPC_URL || !PRIVATE_KEY) {
    console.error('Ошибка: Установите BSC_TESTNET_RPC_URL и BSC_TESTNET_PRIVATE_KEY в .env');
    process.exit(1);
  }

  const web3 = new Web3(RPC_URL);
  const account = web3.eth.accounts.privateKeyToAccount(
    PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`,
  );
  web3.eth.accounts.wallet.add(account);

  console.log('Деплой контракта TokenBSC с аккаунта:', account.address);

  const balance = await web3.eth.getBalance(account.address);
  console.log('Баланс аккаунта:', web3.utils.fromWei(balance, 'ether'), 'tBNB');

  const artifact = await artifacts.readArtifact('TokenBSC');
  const { abi, bytecode } = artifact;

  const tokenName = 'BSC Test Token';
  const tokenSymbol = 'BTT';
  const initialSupply = web3.utils.toWei('1000000', 'ether'); // 1M токенов

  const initialSupplyFormatted = Number(web3.utils.fromWei(initialSupply, 'ether')).toLocaleString(
    'ru-RU',
  );

  console.log('\n=== Деплой TokenBSC ===');
  console.log('Name:', tokenName);
  console.log('Symbol:', tokenSymbol);
  console.log('Initial Supply:', initialSupplyFormatted + ' ' + tokenSymbol);

  const contract = new web3.eth.Contract(abi);
  const deploy = contract.deploy({
    data: bytecode,
    arguments: [tokenName, tokenSymbol, initialSupply],
  });

  const gasEstimate = await deploy.estimateGas({ from: account.address });
  console.log('Gas Estimate:', gasEstimate.toString());

  const instance = await deploy.send({
    from: account.address,
    gas: gasEstimate,
  });

  const tokenAddress = instance.options.address;
  console.log('TokenBSC задеплоен по адресу:', tokenAddress);

  const chainId = await web3.eth.getChainId();
  console.log('\n=== Информация о деплое ===');
  console.log('Сеть: BNB Smart Chain Testnet');
  console.log('ChainId:', chainId.toString());
  console.log('\nДля использования в .env:');
  console.log(`DEPLOYED_TOKEN_BSC_ADDRESS=${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
