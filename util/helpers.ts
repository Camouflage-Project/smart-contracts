import {ethers} from 'hardhat';
import {Contract, Signer} from 'ethers';

export async function deployNodeOperatorFactory(deployer: Signer, confirmations: number = 1): Promise<Contract> {
  const NodeOperatorFactory = await ethers.getContractFactory('NodeOperatorFactory', deployer);
  const nodeOperatorFactory = await NodeOperatorFactory.deploy();
  await ethers.provider.waitForTransaction(nodeOperatorFactory.deployTransaction.hash, confirmations);
  console.log(`\nNodeOperatorFactory deployed\n\tAt address: ${nodeOperatorFactory.address}`);
  return nodeOperatorFactory;
}

/**
 * Creates the node operator instance.
 * 
 * @param creator Creator's address
 * @param name Name of the node operator
 * @returns Contract instance of the deployed node operator
 */
export async function createNodeOperator(
    creator: String,
    name: String,
    nodeOperatorFactory: Contract
  ): Promise<Contract> {
    const nodeOperatorTxHash = await nodeOperatorFactory.create({creator: creator, name: name});
    const receipt = await ethers.provider.waitForTransaction(nodeOperatorTxHash.hash);
    for (const log of receipt.logs) {
      const parsedLog = nodeOperatorFactory.interface.parseLog(log);
      if (parsedLog.name == "NodeOperatorCreated") {
        const ownerAddress = parsedLog.args.creator;
        const nodeOperatorAddress = parsedLog.args.nodeOperator;
        const issuerAddress = parsedLog.args.name;
        console.log(`\nNodeOperator deployed\n\tAt address: ${nodeOperatorAddress}\n\tOwner: ${ownerAddress}`);
        return (await ethers.getContractAt("NodeOperator", nodeOperatorAddress));
      }
    }
    throw new Error("Issuer creation transaction failed.");
  }
