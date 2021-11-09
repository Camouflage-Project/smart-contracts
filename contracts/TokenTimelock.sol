// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

/**
 * @dev A token holder contract that will allow multiple beneficiaries to extract their
 * tokens after a given release time.
 * Similar to openzeppelin's TokenTimelock, but with the option of locking tokens for 
 * mulitple beneficiaries.
 */
contract TokenTimelock {
    using SafeERC20 for IERC20;

    struct LockedTokenData {
        uint256 amount;
        uint256 releaseTime;
    }

    address public owner;
    IERC20 private immutable _token;
    mapping(address => LockedTokenData) public beneficiaries;

    constructor(IERC20 token_) {
        owner = msg.sender;
        _token = token_;
    }

    /**
     * @return the token being held.
     */
    function token() public view virtual returns (IERC20) {
        return _token;
    }

    /**
     * @notice Locks tokens for beneficiary until release time. Contract owner only function.
     */
    function lock(address beneficiary, uint256 releaseTime, uint256 amount) public virtual {
        require(msg.sender == owner, "TokenTimelock: this function can only be called by the owner");
        require(releaseTime > block.timestamp, "TokenTimelock: release time is before current time");
        require(amount <= token().balanceOf(address(this)), "TokenTimelock: amount is greater than the contract balance");
        require(amount > 0, "TokenTimelock: amount is 0 or less");

        beneficiaries[beneficiary] = LockedTokenData(amount, releaseTime);
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release(address beneficiary) public virtual {
        require(block.timestamp >= beneficiaries[beneficiary].releaseTime, "TokenTimelock: current time is before release time");

        uint256 amount = beneficiaries[beneficiary].amount;
        token().safeTransfer(beneficiary, amount);
        delete beneficiaries[beneficiary];
    }
}