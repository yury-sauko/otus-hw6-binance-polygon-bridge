# Инструкция по настройке проекта 36-binance-polygon-bridge

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
- **Альтернативы на ChainList**: [BNB Smart Chain Testnet](https://chainlist.org/?search=BNB+Smart+Chain+Testnet&testnets=true)

### BSC_TESTNET_PRIVATE_KEY

- Используйте приватный ключ тестового аккаунта с tBNB
- **ВАЖНО**: Никогда не используйте приватный ключ от основного кошелька!

### ETHERSCAN_API_KEY (опционально, для верификации)

- Etherscan API V2 — один ключ для Etherscan и BSCScan
- Получите на [etherscan.io/apis](https://etherscan.io/apis) или [bscscan.com/apis](https://bscscan.com/apis)

### Получение тестовых tBNB

- [ChainList](https://chainlist.org/?search=BNB+Smart+Chain+Testnet&testnets=true) — добавьте тестовую сеть BNB в MetaMask
- [Bnb Faucet](https://www.bnbchain.org/en/testnet-faucet) — получите тестовые токены (необходимо 0.002 BNB в BSC Mainnet)

## Шаг 3: Компиляция контрактов

```bash
pnpm compile
```

## Шаг 4: Деплой в BNB Smart Chain Testnet

1. Убедитесь, что на аккаунте есть tBNB
2. Выполните деплой:

```bash
pnpm deploy:bsc
```

3. Сохраните адрес контракта в `.env`:

```
DEPLOYED_TOKEN_BSC_ADDRESS=0x...
```

## Шаг 5: Верификация контракта (опционально)

После деплоя можно верифицировать контракт на BSCScan:

```bash
pnpm exec hardhat verify --network bscTestnet --build-profile default АДРЕС_КОНТРАКТА "BSC Test Token" "BTT" "1000000000000000000000000"
```

Аргументы конструктора: `name`, `symbol`, `initialSupply` (в wei). Значения должны совпадать с деплоем.

## Шаг 6: Взаимодействие через Web3.js

```bash
pnpm interact
```

Скрипт демонстрирует:

- Получение цены газа
- Проверку баланса tBNB
- Информацию о токене (name, symbol, totalSupply, balanceOf)

## Структура проекта

```
36-binance-polygon-bridge/
├── contracts/
│   └── token-bsc.sol       # ERC20 токен для BSC
├── scripts/
│   ├── deploy.js          # Деплой (Web3.js)
│   └── interact.js        # Взаимодействие (Web3.js)
├── .env                   # Не коммитьте!
├── .env.example
├── hardhat.config.ts
├── package.json
├── README.md
└── SETUP.md
```

## Полезные команды

```bash
# Компиляция
pnpm compile

# Деплой в BSC Testnet
pnpm deploy:bsc

# Взаимодействие с контрактом
pnpm interact

# Верификация на BSCScan (аргументы должны быть аналогичны переданным при деплое)
pnpm exec hardhat verify --network bscTestnet --build-profile default АДРЕС "BSC Test Token" "BTT" "1000000000000000000000000"
```

## Параметры BNB Smart Chain Testnet

- **Chain ID**: 97 (0x61)
- **Символ нативной валюты**: tBNB
- **Explorer**: https://testnet.bscscan.com
