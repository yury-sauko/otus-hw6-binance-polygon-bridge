import { Web3 } from 'web3';
import { artifacts } from 'hardhat';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { NETWORKS_CONFIG } from './lib/constants.js';

/**
 * Скрипт моста TokenBscPol между BSC Testnet и Polygon Amoy.
 * Схема:
 * 1. transferToPolygon/transferToBSC на исходной сети
 * 2. burn на исходной сети
 * 3. mint на целевой сети
 *
 * Запуск: pnpm bridge — сканирует обе сети (последние 200 блоков)
 * и обрабатывает все переводы.
 */

const { bscTestnet: bsc, polygonAmoy: polygon } = NETWORKS_CONFIG;

const PROCESSED_FILE = join(process.cwd(), '.bridge-processed.json');

const getProcessed = () => {
  if (!existsSync(PROCESSED_FILE)) return [];
  try {
    return JSON.parse(readFileSync(PROCESSED_FILE, 'utf-8'));
  } catch {
    return [];
  }
};

const markProcessed = (txHash, logIndex) => {
  const processed = getProcessed();
  const key = `${txHash}-${logIndex}`;
  if (processed.includes(key)) return;
  processed.push(key);
  if (processed.length > 500) processed.splice(0, 250);
  writeFileSync(PROCESSED_FILE, JSON.stringify(processed, null, 0));
};

const isProcessed = (txHash, logIndex) => {
  return getProcessed().includes(`${txHash}-${logIndex}`);
};

async function processDirection(source, target, sourceName, targetName) {
  const web3Source = new Web3(source.rpc);
  const web3Target = new Web3(target.rpc);
  const accountTarget = web3Target.eth.accounts.privateKeyToAccount(
    target.privateKey.startsWith('0x') ? target.privateKey : `0x${target.privateKey}`,
  );
  web3Target.eth.accounts.wallet.add(accountTarget);

  const artifact = await artifacts.readArtifact('TokenBscPol');
  const tokenAbi = artifact.abi;

  const latestBlock = Number(await web3Source.eth.getBlockNumber());
  const fromBlock = Math.max(0, latestBlock - 200);

  const topic0 = web3Source.eth.abi.encodeEventSignature(
    'TransferToOtherChain(address,uint256,uint256)',
  );
  const logs = await web3Source.eth.getPastLogs({
    address: source.tokenAddress,
    fromBlock: BigInt(fromBlock),
    toBlock: BigInt(latestBlock),
    topics: [topic0],
  });

  const transfers = logs.filter((log) => {
    if (log.data.length < 128) return false;
    const targetChainId = BigInt('0x' + log.data.slice(-64));
    return targetChainId === BigInt(target.chainId);
  });

  if (transfers.length === 0) return 0;

  const contractTarget = new web3Target.eth.Contract(tokenAbi, target.tokenAddress);
  let processed = 0;

  for (const log of transfers) {
    const txHash = log.transactionHash;
    const logIndex = log.logIndex;
    if (isProcessed(txHash, logIndex)) continue;

    const from = '0x' + log.topics[1].slice(-40);
    const amount = BigInt('0x' + log.data.slice(2, 66));

    console.log(
      `\n[${sourceName} ---> ${targetName}] ${txHash} | from=${from} | amount=${web3Source.utils.fromWei(
        String(amount),
        'ether',
      )}`,
    );

    try {
      const amountHex = '0x' + amount.toString(16);
      const gasEstimate = await contractTarget.methods
        .mint(from, amountHex)
        .estimateGas({ from: accountTarget.address });

      const block = await web3Target.eth.getBlock('latest');
      const maxPriorityFeePerGas = BigInt(web3Target.utils.toWei('30', 'gwei'));
      const maxFeePerGas = block.baseFeePerGas * 2n + maxPriorityFeePerGas;

      const receipt = await contractTarget.methods
        .mint(from, amountHex)
        .send({
          from: accountTarget.address,
          gas: gasEstimate,
          maxPriorityFeePerGas,
          maxFeePerGas,
        });

      console.log(`Mint: ${receipt.transactionHash}`);
      markProcessed(txHash, logIndex);
      processed++;
    } catch (err) {
      console.error(`Ошибка mint: ${err.message}`);
    }
  }

  return processed;
}

async function main() {
  console.log('\n=== Мост TokenBscPol ===');
  console.log('Сканирование обеих сетей...');

  let totalProcessed = 0;

  for (const [source, target] of [
    [bsc, polygon],
    [polygon, bsc],
  ]) {
    if (!source.rpc || !source.tokenAddress || !source.privateKey) {
      console.warn(`Пропуск: не заданы переменные для ${source.name}`);
      continue;
    }
    if (!target.rpc || !target.tokenAddress || !target.privateKey) {
      console.warn(`Пропуск: не заданы переменные для ${target.name}`);
      continue;
    }

    console.log(`\n--- ${source.name} → ${target.name} ---`);
    const count = await processDirection(source, target, source.name, target.name);
    totalProcessed += count;
  }

  console.log('\n=== Мост завершен ===');
  if (totalProcessed === 0) {
    console.log('Новых событий TransferToOtherChain не найдено.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
