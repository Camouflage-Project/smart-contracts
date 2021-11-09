// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NodeOperator.sol";
import "./Structs.sol";
import "./StakingContractFactory.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NodeOperatorFactory {
    event NodeOperatorCreated(
        address indexed creator,
        address nodeOperator,
        address stablecoin,
        uint256 timestamp
    );

    address[] public instances;
    mapping(string => address) public namespace;
    StakingContractFactory private immutable _stakingContractFactory;
    IERC20 private immutable _camoERC20Token;

    constructor(address camoTokenAddress, address stakingContractFactoryAddress)
    {
        _camoERC20Token = IERC20(camoTokenAddress);
        _stakingContractFactory = StakingContractFactory(
            stakingContractFactoryAddress
        );
    }

    function create(string memory name, address stablecoin)
        public
        returns (address)
    {
        address stakingContract = _stakingContractFactory.getStakingContract(
            msg.sender
        );
        require(
            stakingContract != address(0),
            "There is no staking contract for node operator"
        );

        require(
            _camoERC20Token.balanceOf(stakingContract) > 500,
            "Staking amount is lower that 500"
        );
        require(
            namespace[name] == address(0),
            "Node Operator Factory: Node operator with this name already exists"
        );
        address nodeOperatorAddress = address(
            new NodeOperator(msg.sender, name, stablecoin)
        );
        emit NodeOperatorCreated(
            msg.sender,
            nodeOperatorAddress,
            stablecoin,
            block.timestamp
        );
        return nodeOperatorAddress;
    }
}
