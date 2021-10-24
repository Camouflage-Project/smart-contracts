<br/>
<p align="center">
<img src="https://user-images.githubusercontent.com/38017754/138603052-1b87155f-a03c-4cbc-aac3-f56301cda473.png" width="225" alt="Camouflage logo">
</a>
</p>
<br/>

# Camouflage Contracts

Camouflage Protocol v1.0 written in Solidity language.

## Contract types

There list of contracts is the following:
- NodeOperatorFactory.sol
- NodeOperator.sol
- ResidentialProxyFactory.sol
- ResidentialProxy.sol
- PayoutContract.sol
- StakingContract.sol
- StakingContractFactory.sol
- TreasuryContract.sol
- CamoToken.sol

## Features

- <b>Node Operator Factory</b>
    - A factory contract which keeps track of all the node operators registered. Contains the create function which initializes a new Node Operator and its associated PayoutContract. Criteria for the creation of a new node is that the <i>address</i> creating a new Node deposited a minimum of 500 Camo Tokens into the Staking Contract.

- <b>Node Operator</b>
    - Created by the Node Operator Factory. Contains the name, creator address and factory address.

- <b>Payout Contract</b>
    - In charge of splitting the payments between node operator, residential proxies attached to it, and a buyback of Camo tokens from a DEX which gets transfered to the Treasury Contract. Payout can only be invoked by the NodeOperator.

- <b> Residential Proxy Factory</b>
    - A factory contract which keeps track of all the residential proxies registered.

- <b> Residential Proxy </b>
   - Created by the Residential Proxy Factory. The creator of the residential proxy can attach to a particular node as well as detach and attach to a new one.
   - As soon as a residential proxy attaches to a particular node, his address and timestamp of the attachment is recorded. At the moment he detaches a timestamp of the    detachment is recorded.

- <b> Staking Contract </b>
    - Has the address of the Camo token and the Node Operator Factory.

- <b> Staking Contract Factory </b>
    - Responsible for creating staking contracts for each node operator. Contains a map of user address to staking contract address.

## Staking workflow
In order to create a Node Operator, an address needs to prove it staked the minimum of 500 Camo Tokens into a time locked contract. 

## Soldity Design patterns
Smart contract were developed in accordance with the following [design patterns](https://github.com/fravoll/solidity-patterns).

## Testing
For running all tests on a local hardhat network use `npm test`. For running individual tests specify path to the test file: `npm test -- <path-to-test-file>`

## Testing Flow
1. Deploy Camo ERC-20 token.
2. Deploy staking contract factory.
3. Deploy node operator factory which has a variable pointing to the staking contract factory.
4. Node operator calls approve and deposit functions on the staking contract.
5. A node opeartor can be created.

## Deployment
Deployment is available by executing `deploy.sh` with the desired network parameter. Available networks are configured inside `hardhat.config.ts`.

