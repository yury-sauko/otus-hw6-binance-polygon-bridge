import { Web3 } from 'web3';
import { artifacts } from 'hardhat';
import 'dotenv/config';

/**
 * Скрипт взаимодействия с контрактом TokenBSC в BNB Smart Chain Testnet.
 * Использует Web3.js.
 *
 * Демонстрирует:
 * - Получение цены газа
 * - Проверку баланса tBNB
 * - Взаимодействие с ERC20 (balanceOf, transfer, totalSupply)
 */

const RPC_URL = process.env.BSC_TESTNET_RPC_URL;
const PRIVATE_KEY = process.env.BSC_TESTNET_PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.DEPLOYED_TOKEN_BSC_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY) {
  console.error('Ошибка: Установите BSC_TESTNET_RPC_URL и BSC_TESTNET_PRIVATE_KEY в .env');
  process.exit(1);
}

const web3 = new Web3(RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(
  PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`,
);
web3.eth.accounts.wallet.add(account);

/**
 * Получить цену газа
 */
const getGasPrice = async () => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    console.log('\n=== Цена газа ===');
    console.log('Gas Price (Wei):', gasPrice.toString());
    console.log('Gas Price (Gwei):', web3.utils.fromWei(gasPrice, 'gwei'));
    return gasPrice;
  } catch (error) {
    console.error('Ошибка при получении цены газа:', error.message);
    throw error;
  }
};

/**
 * Получить баланс tBNB
 */
const getBalance = async (address) => {
  try {
    const balance = await web3.eth.getBalance(address);
    console.log('\n=== Баланс аккаунта (tBNB) ===');
    console.log('Адрес:', address);
    console.log('Баланс (Wei):', balance.toString());
    console.log('Баланс (tBNB):', web3.utils.fromWei(balance, 'ether'));
    return balance;
  } catch (error) {
    console.error('Ошибка при получении баланса:', error.message);
    throw error;
  }
};

/**
 * Получить информацию о токене и баланс
 */
const getTokenInfo = async (tokenAbi) => {
  if (!TOKEN_ADDRESS) {
    console.error('Ошибка: Установите DEPLOYED_TOKEN_BSC_ADDRESS в .env');
    return;
  }

  try {
    const contract = new web3.eth.Contract(tokenAbi, TOKEN_ADDRESS);

    const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
      contract.methods.totalSupply().call(),
      contract.methods.balanceOf(account.address).call(),
    ]);

    const getFormattedNumber = (value) => Number(value).toLocaleString('ru-RU');

    console.log('\n=== Информация о токене TokenBSC ===');
    console.log('Адрес контракта:', TOKEN_ADDRESS);
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Decimals:', decimals);
    console.log(
      'Total Supply:',
      getFormattedNumber(web3.utils.fromWei(totalSupply, 'ether')),
      symbol,
    );
    console.log(
      'Баланс аккаунта:',
      getFormattedNumber(web3.utils.fromWei(balance, 'ether')),
      symbol,
    );

    return { name, symbol, decimals, totalSupply, balance };
  } catch (error) {
    console.error('Ошибка при получении информации о токене:', error.message);
    throw error;
  }
};

/**
 * Отправить токены на указанный адрес
 */
const transferTokens = async (toAddress, amountInTokens, tokenAbi) => {
  if (!TOKEN_ADDRESS) {
    console.error('Ошибка: Установите DEPLOYED_TOKEN_BSC_ADDRESS в .env');
    return;
  }

  try {
    const contract = new web3.eth.Contract(tokenAbi, TOKEN_ADDRESS);
    const amountWei = web3.utils.toWei(amountInTokens.toString(), 'ether');

    console.log('\n=== Отправка токенов ===');
    console.log('От:', account.address);
    console.log('Кому:', toAddress);
    console.log('Сумма:', amountInTokens, 'токенов');

    const gasEstimate = await contract.methods
      .transfer(toAddress, amountWei)
      .estimateGas({ from: account.address });

    const receipt = await contract.methods
      .transfer(toAddress, amountWei)
      .send({ from: account.address, gas: gasEstimate });

    console.log('Транзакция выполнена!');
    console.log('Tx Hash:', receipt.transactionHash);
    console.log('Block Number:', receipt.blockNumber);

    return receipt;
  } catch (error) {
    console.error('Ошибка при отправке токенов:', error.message);
    throw error;
  }
};

/**
 * Основная функция
 */
const main = async () => {
  console.log('=== Web3.js Скрипт взаимодействия с TokenBSC ===\n');

  const artifact = await artifacts.readArtifact('TokenBSC');
  const tokenAbi = artifact.abi;

  try {
    await getGasPrice();
    await getBalance(account.address);

    if (TOKEN_ADDRESS) {
      await getTokenInfo(tokenAbi);
    } else {
      console.log('\n⚠ Контракт не задеплоен. Установите DEPLOYED_TOKEN_BSC_ADDRESS в .env');
    }

    console.log('\n=== Скрипт завершен ===');
  } catch (error) {
    console.error('\nКритическая ошибка:', error);
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export { getGasPrice, getBalance, getTokenInfo, transferTokens };
