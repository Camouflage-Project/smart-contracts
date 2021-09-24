// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NodeOperator {

    address private _owner;
    address private _factory;
    string private _name;

    modifier onlyOwner(address caller) {
        require(caller == _owner, 'You are not the owner of this Node Operator');
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == _factory, 'You need to use the Node Operator Factory');
        _;
    }

    constructor(address owner, string memory name) {
        _owner = owner;
        _name = name;
        _factory = msg.sender;
    }
}