import hardhat from 'hardhat';
import { network } from 'hardhat';
import { verifyContract } from '@nomicfoundation/hardhat-verify/verify';

import { NETWORKS_CONFIG, TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY } from './lib/constants.js';

async function main() {
  const connection = await network.connect();
  const networkName = connection.networkName;
  const config = NETWORKS_CONFIG[networkName];

  if (!config) {
    console.error('Ошибка: Запустите через pnpm verify:bsc или pnpm verify:pol');
    process.exit(1);
  }

  if (!config.tokenAddress) {
    console.error(`Ошибка: Установите адрес токена для ${config.name} в .env`);
    process.exit(1);
  }

  console.log(`\nВерификация TokenBscPol в ${config.name}`);
  console.log(`Адрес контракта токена: ${config.tokenAddress}\n`);

  await verifyContract(
    {
      address: config.tokenAddress,
      constructorArgs: [TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY],
      provider: 'etherscan',
    },
    hardhat,
  );

  console.log('Верификация успешна!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Верификация не удалась:', err.message);
    process.exit(1);
  });
