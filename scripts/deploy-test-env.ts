import { ethers } from "hardhat";
import { Contract } from "ethers";
import * as helpers from "../util/helpers";

async function main() {
  // Used to get the list of accounts in the node we're connected to, it depends on the network,
  // the default being the hardhat network.
  const accounts = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const deployer = accounts[0];
  const deployerAddress = deployer.address;
  console.log(`Chain Id: ${network.chainId}`);
  console.log(`Deployer address (accounts[0]): ${deployerAddress}`);
  console.log(
    `Deployer balance (accounts[0]):`,
    (await ethers.provider.getBalance(deployerAddress)).toString()
  );
  console.log(`Network is: ${process.env.NETWORK}`);

  const deployedToken: Contract = process.env.CAMO_TOKEN
    ? await ethers.getContractAt("CamoToken", process.env.CAMO_TOKEN)
    : await helpers.deployCamoToken(deployer, "Camouflage", "Camo", "1000");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
