// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NodeOperator.sol";
import "./Structs.sol";

contract NodeOperatorFactory {

    event NodeOperatorCreated(address indexed creator, address nodeOperator, uint256 timestamp);


    address[] public instances;
    mapping (string => address) public namespace;

    function create(Structs.NodeOperatorParams memory params) public returns (address) {
        require (namespace[params.name] == address(0), 'Node Operator Factory: Node operator with this name already exists');
        address nodeOperatorAddress = address(new NodeOperator(params.creator, params.name));
        emit NodeOperatorCreated(params.creator, nodeOperatorAddress, block.timestamp);
        return nodeOperatorAddress;
    }
}