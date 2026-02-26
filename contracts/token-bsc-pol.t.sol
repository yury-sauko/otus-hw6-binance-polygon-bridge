// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./token-bsc-pol.sol";

contract TokenBscPolTest {
    TokenBscPol token;
    uint256 constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    function setUp() public {
        token = new TokenBscPol("Bridge Token BscPol", "BTBP", INITIAL_SUPPLY);
    }

    function test_InitialSupplyMintedToDeployer() public view {
        require(
            token.balanceOf(address(this)) == INITIAL_SUPPLY,
            "initial supply not minted to deployer"
        );
        require(
            token.totalSupply() == INITIAL_SUPPLY,
            "total supply mismatch"
        );
    }

    function test_NameAndSymbol() public view {
        require(
            keccak256(bytes(token.name())) == keccak256("Bridge Token BscPol"),
            "wrong name"
        );
        require(
            keccak256(bytes(token.symbol())) == keccak256("BTBP"),
            "wrong symbol"
        );
    }

    function test_MintByOwner() public {
        uint256 mintAmount = 500 * 10 ** 18;
        address recipient = address(0x123);

        token.mint(recipient, mintAmount);

        require(
            token.balanceOf(recipient) == mintAmount,
            "recipient balance after mint"
        );
        require(
            token.totalSupply() == INITIAL_SUPPLY + mintAmount,
            "total supply after mint"
        );
    }

    function test_MintByNonOwnerReverts() public {
        NonOwnerMinter minter = new NonOwnerMinter();

        try minter.tryMint(token, address(0x456), 100) {
            revert("non-owner mint should revert");
        } catch {}
    }

    function test_TransferToPolygonBurnsTokens() public {
        uint256 transferAmount = 100 * 10 ** 18;
        uint256 balanceBefore = token.balanceOf(address(this));

        token.transferToPolygon(transferAmount);

        require(
            token.balanceOf(address(this)) == balanceBefore - transferAmount,
            "tokens not burned"
        );
        require(
            token.totalSupply() == INITIAL_SUPPLY - transferAmount,
            "total supply not reduced"
        );
    }

    function test_TransferToBSCBurnsTokens() public {
        uint256 transferAmount = 100 * 10 ** 18;
        uint256 balanceBefore = token.balanceOf(address(this));

        token.transferToBSC(transferAmount);

        require(
            token.balanceOf(address(this)) == balanceBefore - transferAmount,
            "tokens not burned"
        );
        require(
            token.totalSupply() == INITIAL_SUPPLY - transferAmount,
            "total supply not reduced"
        );
    }

    function test_TransferWithInsufficientBalanceReverts() public {
        uint256 excessAmount = INITIAL_SUPPLY + 1;

        try token.transferToPolygon(excessAmount) {
            revert("should revert on insufficient balance");
        } catch {}
    }
}

contract NonOwnerMinter {
    function tryMint(
        TokenBscPol token,
        address to,
        uint256 amount
    ) external {
        token.mint(to, amount);
    }
}
