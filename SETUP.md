# Инструкция по инициализации проекта

## Шаг 1: Установка зависимостей

```bash
cd <путь к папке с проектом>
pnpm install
```

## Шаг 2: Настройка окружения

1. Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

2. Заполните `.env` файл:

### BSC_TESTNET_RPC_URL

- **Публичный RPC**: `https://api.zan.top/bsc-testnet`
- **Альтернативы на ChainList**: [BNB Smart Chain Testnet](https://chainlist.org/chain/97)

### BSC_TESTNET_PRIVATE_KEY / POLYGON_AMOY_PRIVATE_KEY

- Используйте приватный ключ тестового аккаунта
- Для моста можно использовать один ключ для обеих сетей (владелец контракта)
- **ВАЖНО**: Никогда не используйте приватный ключ от основного кошелька!

### POLYGON_AMOY_RPC_URL

- **Публичный RPC**: `https://rpc-amoy.polygon.technology`
- **Альтернативы на ChainList**: [ChainList Amoy](https://chainlist.org/chain/80002)

### ETHERSCAN_API_KEY (для верификации)

- Etherscan API V2 — один ключ для Etherscan и BSCScan
- Получите на [etherscan.io/apidashboard](https://etherscan.io/apidashboard)

##

### Получение тестовых токенов

Тестовая сеть **BNB Smart Chain Testnet** для подключения MetaMask - см. [ChainList](https://chainlist.org/?search=BNB+Smart+Chain+Testnet&testnets=true)

Получение тестовых токенов **tBNB** - [Bnb Faucet](https://www.bnbchain.org/en/testnet-faucet) (необходимо 0.002 BNB в BSC Mainnet)

##

Тестовая сеть **Amoy (polygon)** для подключения MetaMask - см. [ChainList](https://chainlist.org/?testnets=true&search=amoy)

Получение тестовых токенов **POL** - [polygon Faucet](https://faucet.polygon.technology/)

##

## Шаг 3: Компиляция контрактов

```bash
pnpm compile
```

## Шаг 4: Тестирование

```bash
pnpm test
```

Запускает Solidity-тесты из `contracts/token-bsc-pol.t.sol`. Все 7 тестов должны пройти.

## Шаг 5: Деплой TokenBscPol

**BSC Testnet** (нужны tBNB):

```bash
pnpm deploy:bsc
```

**Polygon Amoy** (нужны POL):

```bash
pnpm deploy:pol
```

Сохраните адреса задеплоенных контрактов в `.env`:

```
DEPLOYED_TOKEN_BSC_ADDRESS=0x...
DEPLOYED_TOKEN_POLYGON_ADDRESS=0x...
```

## Шаг 6: Верификация контрактов

После деплоя и сохранения адресов в `.env` выполните верификацию:

```bash
pnpm verify:bsc
pnpm verify:pol
```

## Шаг 7: Взаимодействие

```bash
pnpm interact
```

Скрипт выводит информацию о токене для каждой сети (BSC и Polygon):

- Цену газа
- Баланс (tBNB / POL)
- Информацию о токене: symbol, totalSupply, balanceOf

## Шаг 8: Мост между сетями (ручной режим)

Мост работает в **два ручных шага**:

### Мост, шаг 1. Вызов функции перевода токенов в исходной сети

К примеру, через [PolygonScan](https://amoy.polygonscan.com/) или [BscScan](https://testnet.bscscan.com/) → Contract → Write Contract:

- **BSC → Polygon**: вызовите `transferToPolygon(amount)` на контракте в BSC
- **Polygon → BSC**: вызовите `transferToBSC(amount)` на контракте в Polygon

Подтвердите транзакцию в кошельке. Токены будут сожжены в исходной сети, эмитируется событие `TransferToOtherChain`.

### Мост, шаг 2. Запуск скрипта моста

После подтверждения транзакции запустите:

```bash
pnpm bridge
```

Скрипт **сканирует обе сети** (BSC и Polygon, последние 200 блоков), находит события `TransferToOtherChain` и вызывает `mint` на целевой сети. Токены появятся на балансе в целевой сети.

## Структура проекта

```
36-binance-polygon-bridge/
├── contracts/
│   ├── token-bsc-pol.sol     # ERC20 с burn/mint для моста
│   └── token-bsc-pol.t.sol   # Solidity-тесты контракта
├── scripts/
│   ├── lib/
│   │   └── constants.js   # Общие константы и конфигурация сетей
│   ├── deploy.js        # Деплой контракта
│   ├── verify.js        # Верификация контракта на блок-эксплорере
│   ├── interact.js      # Информация о токене в обеих сетях
│   └── bridge.js        # Мост burn → mint
├── .env
├── .env.example
├── hardhat.config.ts
├── package.json
├── README.md
└── SETUP.md
```

## Полезные команды

| Команда           | Описание                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm compile`    | Компиляция контрактов                                                                                        |
| `pnpm test`       | Запуск Solidity-тестов                                                                                       |
| `pnpm deploy:bsc` | Деплой TokenBscPol в BSC Testnet                                                                             |
| `pnpm deploy:pol` | Деплой TokenBscPol в Polygon Amoy                                                                            |
| `pnpm verify:bsc` | Верификация контракта в BSC Testnet                                                                          |
| `pnpm verify:pol` | Верификация контракта в Polygon Amoy                                                                         |
| `pnpm interact`   | Информация о токене в обеих сетях                                                                            |
| `pnpm bridge`     | Мост: сканирует обе сети (последние 200 блоков), обрабатывает события `TransferToOtherChain` и вызывает mint |
