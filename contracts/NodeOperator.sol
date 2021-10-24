// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NodeOperator {
    event ProxyRegistered(
        address indexed proxy,
        address nodeOperator,
        uint256 timestamp
    );

    address private _owner;
    address private _factory;
    string private _name;

    // ERC20 stablecoin token contract being held
    IERC20 private immutable _stablecoin;

    mapping(uint256 => address) public proxiesCount;
    mapping(address => address) public proxies;
    uint256 public totalProxies = 0;

    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "You are not the owner of this Node Operator"
        );
        _;
    }

    modifier onlyFactory() {
        require(
            msg.sender == _factory,
            "You need to use the Node Operator Factory"
        );
        _;
    }

    constructor(
        address ownerAddress,
        string memory name,
        address stablecoinAddress
    ) {
        _owner = ownerAddress;
        _name = name;
        _factory = msg.sender;
        _stablecoin = IERC20(stablecoinAddress);
    }

    /**
     * @return stablecoin being held.
     */
    function stablecoin() public view virtual returns (IERC20) {
        return _stablecoin;
    }

    /**
     * @return owner of the node.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    function depositStablecoin(uint256 _amount) public returns (bool) {
        return stablecoin().transferFrom(msg.sender, address(this), _amount);
    }

    function registerProxy() public {
        require(
            proxies[msg.sender] == address(0),
            "Proxy is already registered with this node operator"
        );
        proxiesCount[totalProxies] = msg.sender;
        proxies[msg.sender] = msg.sender;
        ++totalProxies;
        emit ProxyRegistered(msg.sender, address(this), block.timestamp);
    }

    function payout() external onlyOwner {
        uint256 stablecoinBalance = stablecoin().balanceOf(address(this));
        uint256 nodePayout = (stablecoinBalance * 50) / 100;
        uint256 proxyPayoutAmount = (stablecoinBalance - nodePayout) /
            totalProxies;
        for (uint256 i = 0; i < totalProxies; i++) {
            // Here msg.sender should be the address(this)
            stablecoin().transfer(proxiesCount[i], proxyPayoutAmount);
        }
        stablecoin().transfer(owner(), nodePayout);
    }
}
