import {ethers} from 'hardhat';
import {Contract, Signer} from 'ethers';

const config = {
  confirmationsForDeploy: 1
}

export async function deployNodeOperatorFactory(deployer: Signer, camoTokenAddress: String, stakingContractFactory: String, confirmations: number = config.confirmationsForDeploy): Promise<Contract> {
  const NodeOperatorFactory = await ethers.getContractFactory('NodeOperatorFactory', deployer);
  const nodeOperatorFactory = await NodeOperatorFactory.deploy(camoTokenAddress, stakingContractFactory);
  await ethers.provider.waitForTransaction(nodeOperatorFactory.deployTransaction.hash, confirmations);
  console.log(`\nNodeOperatorFactory deployed\n\tAt address: ${nodeOperatorFactory.address}`);
  return nodeOperatorFactory;
}

export async function deployCamoToken(deployer: Signer, name: String, symbol: String, supply: string, confirmations: number = config.confirmationsForDeploy): Promise<Contract> {
  const supplyWei = ethers.utils.parseEther(supply);
  const CamoToken = await ethers.getContractFactory('CamoToken', deployer);
  const camoToken = await CamoToken.deploy(name, symbol, supplyWei);
  await ethers.provider.waitForTransaction(camoToken.deployTransaction.hash, confirmations);
  console.log(`\CamoToken deployed\n\tAt address: ${camoToken.address}`);
  return camoToken;
}

export async function deployStablecoin(deployer: Signer, supply: string, confirmations: number = config.confirmationsForDeploy): Promise<Contract> {
  const supplyWei = ethers.utils.parseEther(supply);
  const USDC = await ethers.getContractFactory("USDC", deployer);
  const stablecoin = await USDC.deploy(supplyWei);
  await ethers.provider.waitForTransaction(stablecoin.deployTransaction.hash, confirmations)
  console.log(`\nStablecoin deployed\n\tAt address: ${stablecoin.address}`);
  return stablecoin;
}

export async function deployStakingContractFactory(deployer: Signer, camoTokenAddress: String, confirmations: number = config.confirmationsForDeploy): Promise<Contract> {
  const StakingContractFactory = await ethers.getContractFactory('StakingContractFactory', deployer);
  const stakingContractFactory = await StakingContractFactory.deploy(camoTokenAddress);
  await ethers.provider.waitForTransaction(stakingContractFactory.deployTransaction.hash, confirmations);
  console.log(`\nStakingContractFactory deployed\n\tAt address: ${stakingContractFactory.address}`);
  return stakingContractFactory;
}

export async function deployTokenTimelock(deployer: Signer, camoTokenAddress: String, confirmations: number = config.confirmationsForDeploy): Promise<Contract> {
  const tokenTimelockFactory = await ethers.getContractFactory('TokenTimelock', deployer);
  const tokenTimelock = await tokenTimelockFactory.deploy(camoTokenAddress);
  await ethers.provider.waitForTransaction(tokenTimelock.deployTransaction.hash, confirmations);
  console.log(`\nTokenTimelock deployed\n\tAt address: ${tokenTimelock.address}`);
  return tokenTimelock;
}

export async function createStakingContract(stakingContractFactory: Contract, staker: Signer, releaseTime: number): Promise<Contract> {
  const createStakingContractHash = await stakingContractFactory.connect(staker).newStakingContract(releaseTime); 
  const receipt = await ethers.provider.waitForTransaction(createStakingContractHash.hash); 
  for (const log of receipt.logs) {
    const parsedLog = stakingContractFactory.interface.parseLog(log);
    if (parsedLog.name == "StakingContractCreated") {
      const ownerAddress = parsedLog.args.creator;
      const stakingContractAddress = parsedLog.args.stakingContract;
      console.log(`\nStakingContract deployed\n\tAt address: ${stakingContractAddress}\n\tOwner: ${ownerAddress}`);
      return (await ethers.getContractAt("StakingContract", stakingContractAddress));
    }
  }
  throw new Error("Issuer creation transaction failed.");
}

/**
 * Creates the node operator instance.
 * 
 * @param creator Creator's address
 * @param name Name of the node operator
 * @returns Contract instance of the deployed node operator
 */
export async function createNodeOperator(
    creator: Signer,
    name: String,
    nodeOperatorFactory: Contract, 
    stablecoin: string
  ): Promise<Contract> {
    const nodeOperatorTxHash = await nodeOperatorFactory.connect(creator).create(name, stablecoin);
    const receipt = await ethers.provider.waitForTransaction(nodeOperatorTxHash.hash);
    for (const log of receipt.logs) {
      const parsedLog = nodeOperatorFactory.interface.parseLog(log);
      if (parsedLog.name == "NodeOperatorCreated") {
        const ownerAddress = parsedLog.args.creator;
        const nodeOperatorAddress = parsedLog.args.nodeOperator;
        const issuerAddress = parsedLog.args.name;
        const stablecoin = parsedLog.args.stablecoin;
        console.log(`\nNodeOperator deployed\n\tAt address: ${nodeOperatorAddress}\n\tOwner: ${ownerAddress}\n\tStablecoin: ${stablecoin}`);
        return (await ethers.getContractAt("NodeOperator", nodeOperatorAddress));
      }
    }
    throw new Error("Issuer creation transaction failed.");
  }

  export async function transferERC20Token(from: Signer, to: string, camoContract: Contract, amount: string) {
    const amountWei = ethers.utils.parseEther(amount);
    await camoContract.connect(from).transfer(to, amountWei);
  }

  export async function approveSpendingCamoToken(from: Signer, stakingContract: Contract, amount: string) {
    const amountWei = ethers.utils.parseEther(amount);
    await stakingContract.connect(from).approveSpendToken(amountWei);
  }

  /*
   I could use => await camoToken.connect(staker).transfer(stakingContract.address, amount) but in that case I can only call that 
   directly on the ERC-20 token. in case I want to adjust that logic into anything custom I need to use these two steps approve/ transferFrom.
  */
  export async function stake(staker:Signer, camoToken: Contract, stakingContract: Contract, amount: string) {
    const amountWei = ethers.utils.parseEther(amount);
    await camoToken.connect(staker).approve(stakingContract.address, amountWei);
    await stakingContract.connect(staker).depositCamoTokens(amountWei);
  }

  export async function releaseStake(staker:Signer, stakingContract: Contract) {
    await stakingContract.connect(staker).release();
  }

  export async function getBlockTimestampInSeconds(): Promise<number> {
    const blockInfo = await ethers.provider.getBlock("latest");
    return blockInfo.timestamp;
  }

  export async function getBalance(token: Contract, address: string): Promise<string> {
    return ethers.utils.formatEther(await token.balanceOf(address));
  }

  export async function payToNode(payer: Signer, stablecoin: Contract, nodeOperator: Contract, amount: string) {
      const amountWei = ethers.utils.parseEther(amount);
      await stablecoin.connect(payer).approve(nodeOperator.address, amountWei);
      await nodeOperator.connect(payer).depositStablecoin(amountWei);
  }

  export async function registerProxy(proxy: Signer, nodeOperator: Contract) {
    await nodeOperator.connect(proxy).registerProxy();
  }

  export async function payout(node: Signer, nodeOperator: Contract) {
    await nodeOperator.connect(node).payout();
  }
