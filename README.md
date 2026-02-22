# Урок 36, план ДЗ

### 1. Напишите простой контракт, который будет успешно работать в Binance Smart Chain (BSC), загрузите его на тестовую сеть.

Выполнено. Ссылка на верифицированный контракт на BscScan: [клик сюда](https://testnet.bscscan.com/address/0x4849358a3713ea5Bde780c32889BaCC31670d069#code)

### 2. Модифицируйте этот контракт так, чтобы он мог работать в сети Polygon (Matic), и также загрузите его на соответствующую тестовую сеть.

### 3. Используйте мосты между блокчейнами, чтобы перевести токены из одной сети в другую. Это должно быть реализовано в виде кода на JavaScript с использованием Web3.js.

##

## Полезные ссылки

Тестовая сеть **BNB Smart Chain Testnet** для подключения MetaMask - см. [ChainList](https://chainlist.org/?search=BNB+Smart+Chain+Testnet&testnets=true)

Получение тестовых токенов **tBNB** - [Bnb Faucet](https://www.bnbchain.org/en/testnet-faucet) (необходимо 0.002 BNB в BSC Mainnet)

##

## Запуск проекта

См. [SETUP.md](./SETUP.md)

##

## Верификация контракта на BSCScan

1. Получите API ключ на [etherscan.io/apidashboard](https://etherscan.io/apidashboard) (Etherscan API V2)
2. Добавьте в `.env`: `ETHERSCAN_API_KEY=ваш_ключ`
3. Выполните следующую команду (аргументы конструктора: name, symbol, initialSupply в wei - должны быть аналогичны переданным при деплое):

```bash
pnpm exec hardhat verify --network bscTestnet --build-profile default АДРЕС_КОНТРАКТА "BSC Test Token" "BTT" "1000000000000000000000000"
```

