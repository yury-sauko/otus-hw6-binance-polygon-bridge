import { network, artifacts } from 'hardhat';
import { Web3 } from 'web3';

import { NETWORKS_CONFIG, TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY } from './lib/constants.js';

/**
 * Скрипт деплоя TokenBscPol.
 * Запуск: pnpm deploy:bsc или pnpm deploy:pol
 */
async function main() {
  const connection = await network.connect();
  const networkName = connection.networkName;
  const config = NETWORKS_CONFIG[networkName];

  if (!config) {
    console.error('Ошибка: Запустите через pnpm deploy:bsc или pnpm deploy:pol');
    process.exit(1);
  }

  if (!config.rpc || !config.privateKey) {
    console.error(`Ошибка: Установите RPC и PRIVATE_KEY для ${networkName} в .env`);
    process.exit(1);
  }

  const web3 = new Web3(config.rpc);
  const account = web3.eth.accounts.privateKeyToAccount(
    config.privateKey.startsWith('0x') ? config.privateKey : `0x${config.privateKey}`,
  );
  web3.eth.accounts.wallet.add(account);

  console.log(`\nДеплой TokenBscPol в ${config.name} с аккаунта:`, account.address);

  const balance = await web3.eth.getBalance(account.address);
  console.log('Баланс:', web3.utils.fromWei(balance, 'ether'), config.nativeSymbol);

  const artifact = await artifacts.readArtifact('TokenBscPol');
  const { abi, bytecode } = artifact;

  const contract = new web3.eth.Contract(abi);
  const deploy = contract.deploy({
    data: bytecode,
    arguments: [TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY],
  });

  const gasEstimate = await deploy.estimateGas({ from: account.address });
  const block = await web3.eth.getBlock('latest');
  const maxPriorityFeePerGas = BigInt(web3.utils.toWei('30', 'gwei'));
  const maxFeePerGas = block.baseFeePerGas * 2n + maxPriorityFeePerGas;

  const instance = await deploy.send({
    from: account.address,
    gas: gasEstimate,
    maxPriorityFeePerGas,
    maxFeePerGas,
  });
  const tokenAddress = instance.options.address;

  console.log('\nTokenBscPol задеплоен!');
  console.log(
    `\nДля .env: DEPLOYED_TOKEN_${
      networkName === 'bscTestnet' ? 'BSC' : 'POLYGON'
    }_ADDRESS=${tokenAddress}`,
  );
  console.log(
    `\nДля верификации запустите команду: pnpm verify:${
      networkName === 'bscTestnet' ? 'bsc' : 'pol'
    }`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
