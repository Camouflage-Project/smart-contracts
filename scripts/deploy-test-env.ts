import {ethers} from 'hardhat';
import {Contract} from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Used to get the list of accounts in the node we're connected to, it depends on the network,
  // the default being the hardhat network.
  const accounts = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const deployer = accounts[0];
  const deployerAddress = deployerAddress;
  console.log(`Network name: ${network.name}`);
  console.log(`Chain Id: ${network.chainId}`);
  console.log(`Deployer address (accounts[0]): ${deployerAddress}`);
  console.log(`Deployer balance (accounts[0]):`, (await ethers.provider.getBalance(deployerAddress)).toString());

  const token = await ethers.getContractFactory('Token');
  const deployedToken = await token.deploy(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL);
  await ethers.provider.waitForTransaction(deployedToken.deployTransaction.hash, 1);
  console.log(`Token is deployed at: ${deployedToken.address}`);
  const tokenName = await deployedToken.name();
  const tokenSymbol = await deployedToken.symbol();
  const tokenOwner = await deployedToken.owner();
  console.log(`Token name is: ${tokenName}`);
  console.log(`Token symbol is: ${tokenSymbol}`);
  console.log(`Token owner is: ${tokenOwner}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
