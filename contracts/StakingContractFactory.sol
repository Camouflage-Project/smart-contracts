// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StakingContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContractFactory {
    // mapping of wallet address to stakingContractAddress
    mapping(address => address) wallets;
    IERC20 public camoToken;

    event StakingContractCreated(
        address indexed creator,
        address stakingContract,
        uint256 timestamp
    );

    constructor(IERC20 _camoToken) {
        camoToken = _camoToken;
    }

    function getStakingContract(address _wallet) public view returns (address) {
        return wallets[_wallet];
    }

    function newStakingContract(uint256 releaseTime)
        public
        payable
        returns (address)
    {
        address stakingContract = address(
            new StakingContract(address(camoToken), msg.sender, releaseTime)
        );
        wallets[msg.sender] = stakingContract;
        emit StakingContractCreated(
            msg.sender,
            stakingContract,
            block.timestamp
        );
        return stakingContract;
    }
}
