<br/>
<p align="center">
<img src="https://user-images.githubusercontent.com/38017754/138603052-1b87155f-a03c-4cbc-aac3-f56301cda473.png" width="225" alt="Camouflage logo">
</a>
</p>
<br/>

# Camouflage Smart Contracts

Camouflage Protocol v1.0 written in Solidity language.

 ## Requirements

- [NPM](https://www.npmjs.com/)

## Installation

### Goerli Ethereum Testnet
Set your `GOERLI_RPC` [environment variable.](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html). You can get one for free at [Alchemy's site.](https://www.alchemy.com/) You'll also need to set the variable `SEED_PHRASE`, which is your seed phrase from your wallet, ie MetaMask. This is needed for deploying contracts to public networks. You can optionally set your `PRIVATE_KEY` environment variable instead with some changes to the `hardhat.config.ts`.

### Matic Mumbai Testnet
Set your `MUMBAI_RPC` [environment variable](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html). You can get one for free at [Alchemy's site.](https://www.alchemy.com/). You'll also need to set the variable `SEED_PHRASE`, which is your seed phrase from your wallet, ie MetaMask. This is needed for deploying contracts to public networks. You can optionally set your `PRIVATE_KEY` environment variable instead with some changes to the `hardhat.config.ts`. You can obtain testnet MATIC via the [MATIC Faucet.](https://faucet.matic.network/)

### Other network settings
Deployments to other networks can be achieved by defining additional entries in the `hardhat.config.ts`.

### Setting Environment Variables
You can set these in your `.env` file if you're unfamiliar with how setting environment variables work. Check out our [.env example](https://github.com/Camouflage-Project/smart-contracts/blob/master/.env.example). If you wish to use this method to set these variables, update the values in the .env.example file, and then rename it to '.env'

![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+) **WARNING** ![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+)

Don't commit and push any changes to .env files that may contain sensitive information, such as a private key or seed_phrase! If this information reaches a public GitHub repository, someone can use it to check if you have any Mainnet funds in that wallet address, and steal them!

`.env` example:
```
GOERLI_RPC=https://eth-goerli.alchemyapi.io/v2/your_api_key
MUMBAI_RPC=ttps://polygon-mumbai.g.alchemy.com/v2/your_api_key
MATIC_RPC=https://polygon-mainnet.g.alchemy.com/v2/your_api_key
ETH_MAINNET_RPC=https://eth-mainnet.alchemyapi.io/v2/your_api_key
SEED_PHRASE=bla bla thunder unable field verify geal toward fossil ozone submit ozone
```
`bash` example
```
export GOERLI_RPC=https://eth-goerli.alchemyapi.io/v2/your_api_key
export MUMBAI_RPC=ttps://polygon-mumbai.g.alchemy.com/v2/your_api_key
export MATIC_RPC=https://polygon-mainnet.g.alchemy.com/v2/your_api_key
export ETH_MAINNET_RPC=https://eth-mainnet.alchemyapi.io/v2/your_api_key
export SEED_PHRASE=bla bla thunder unable field verify geal toward fossil  ozone submit ozone
```

Then you can install all the dependencies

```bash
npm install
```

## Deploy

Deployment scripts are in the [scripts](https://github.com/Camouflage-Project/smart-contracts/blob/master/scripts) directory. 

Deployment is available by executing [deploy.sh](https://github.com/Camouflage-Project/smart-contracts/blob/master/deploy.sh) with the desired network parameter. 
Network properties are read from the parameter set referenced in the installation section.
Set values inside [deploy.sh](https://github.com/Camouflage-Project/smart-contracts/blob/master/deploy.sh) to exclude deploying certain contracts.

## Test
Tests are located in the [test](https://github.com/Camouflage-Project/smart-contracts/blob/master/test) directory.

For running all tests on a local hardhat network use `npm test`.

## Linting

For linting of `.ts` files use
```
npm run lint-and-fix
```

For linting of `.sol` files use
```
npm run prettier
```

## Contract types

There list of contracts is the following:
- NodeOperatorFactory.sol
- NodeOperator.sol
- StakingContract.sol
- StakingContractFactory.sol
- CamoToken.sol
- USDC.sol

## Features

- <b>Node Operator Factory</b>
    - A factory contract which keeps track of all the node operators registered. Contains the create function which initializes a new Node Operator and its associated PayoutContract. Criteria for the creation of a new node is that the <i>address</i> creating a new Node deposited a minimum of 500 Camo Tokens into the Staking Contract.

- <b>Node Operator</b>
    - Created by the Node Operator Factory. Contains the name, creator address and factory address.

- <b> Staking Contract </b>
    - Has the address of the Camo token and the Node Operator Factory.

- <b> Staking Contract Factory </b>
    - Responsible for creating staking contracts for each node operator. Contains a map of user address to staking contract addresses.

## Soldity Design patterns
Smart contract were developed in accordance with the following [design patterns](https://github.com/fravoll/solidity-patterns).
