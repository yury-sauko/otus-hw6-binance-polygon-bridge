// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenBscPol
 * @dev ERC20 токен для BSC и Polygon с мостом между сетями
 */
contract TokenBscPol is ERC20, Ownable {
    uint256 private constant CHAIN_ID_BSC = 97;
    uint256 private constant CHAIN_ID_POLYGON = 80002;

    error AlreadyOnPolygon();
    error AlreadyOnBSC();

    event TransferToOtherChain(
        address indexed from,
        uint256 amount,
        uint256 targetChainId
    );

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Переводит токены в сеть Polygon (сжигает на текущей сети)
     */
    function transferToPolygon(uint256 amount) external {
        if (block.chainid == CHAIN_ID_POLYGON) revert AlreadyOnPolygon();

        _burn(msg.sender, amount);
        emit TransferToOtherChain(msg.sender, amount, CHAIN_ID_POLYGON);
    }

    /**
     * @dev Переводит токены в сеть BSC (сжигает на текущей сети)
     */
    function transferToBSC(uint256 amount) external {
        if (block.chainid == CHAIN_ID_BSC) revert AlreadyOnBSC();

        _burn(msg.sender, amount);
        emit TransferToOtherChain(msg.sender, amount, CHAIN_ID_BSC);
    }

    /**
     * @dev Выпускает токены на указанный адрес. Только владелец (для моста)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
