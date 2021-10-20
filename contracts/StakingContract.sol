// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
import "hardhat/console.sol";

/*
This contract is created at the beginning, and it should keep track of staked amounts by various addresses,
it should also expose those amounts so they can be easily checked while calling Node Factory's create function. 
*/

contract StakingContract is TokenTimelock {
    uint256 constant minStakingAmount = 500 * (10**18);
    bool depositedMinimum = false;

    address public owner;

    constructor(
        address camoTokenAddress_,
        address beneficiary_,
        uint256 releaseTime_
    ) TokenTimelock(IERC20(camoTokenAddress_), beneficiary_, releaseTime_) {}

    function contractBalance() public view returns (uint256 _amount) {
        return token().balanceOf(address(this));
    }

    function senderBalance() public view returns (uint256) {
        return token().balanceOf(msg.sender);
    }

    function allowance() public view returns (uint256) {
        return token().allowance(msg.sender, address(this));
    }

    function depositCamoTokens(uint256 _amount) external payable {
        uint stakedAmount = contractBalance();
        if (stakedAmount == 0) {
            require(
            _amount >= minStakingAmount,
            "Trying to stake less than the minimum staking amount"
        );
        }        
        address from = msg.sender;
        address to = address(this);

        token().transferFrom(from, to, _amount);
    }
}
