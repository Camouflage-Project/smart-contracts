import { ethers } from "hardhat";
import { Signer } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { CamoToken, ERC20, NodeOperator, NodeOperatorFactory, StakingContract, StakingContractFactory, TokenTimelock, USDC } from "../typechain-types";

const config = {
  confirmationsForDeploy: 1,
};

export async function deployNodeOperatorFactory(
  deployer: Signer,
  camoTokenAddress: String,
  stakingContractFactory: String,
  confirmations: number = config.confirmationsForDeploy
): Promise<NodeOperatorFactory> {
  const NodeOperatorFactory = await ethers.getContractFactory(
    "NodeOperatorFactory",
    deployer
  );
  const nodeOperatorFactory = await NodeOperatorFactory.deploy(
    camoTokenAddress,
    stakingContractFactory
  ) as NodeOperatorFactory;
  await ethers.provider.waitForTransaction(
    nodeOperatorFactory.deployTransaction.hash,
    confirmations
  );
  console.log(
    `\nNodeOperatorFactory deployed\n\tAt address: ${nodeOperatorFactory.address}`
  );
  return nodeOperatorFactory;
}

export async function deployCamoToken(
  deployer: Signer,
  name: string,
  symbol: string,
  supply: string,
  confirmations: number = config.confirmationsForDeploy
): Promise<CamoToken> {
  const supplyWei = ethers.utils.parseEther(supply);
  const CamoToken = await ethers.getContractFactory("CamoToken", deployer);
  const camoToken = await CamoToken.deploy(name, symbol, supplyWei) as CamoToken;
  await ethers.provider.waitForTransaction(
    camoToken.deployTransaction.hash,
    confirmations
  );
  console.log(
    `CamoToken deployed\n\tAt address: ${camoToken.address
    }\n\tName:${await camoToken.name()}\n\tSymbol:${await camoToken.symbol()}\n\tSupply:${await camoToken.totalSupply()}`
  );
  return camoToken;
}

export async function deployStablecoin(
  deployer: Signer,
  supply: string,
  confirmations: number = config.confirmationsForDeploy
): Promise<USDC> {
  const supplyWei = ethers.utils.parseEther(supply);
  const USDC = await ethers.getContractFactory("USDC", deployer);
  const stablecoin = await USDC.deploy(supplyWei) as USDC;
  await ethers.provider.waitForTransaction(
    stablecoin.deployTransaction.hash,
    confirmations
  );
  console.log(`\nStablecoin deployed\n\tAt address: ${stablecoin.address}`);
  return stablecoin;
}

export async function deployStakingContractFactory(
  deployer: Signer,
  camoTokenAddress: String,
  confirmations: number = config.confirmationsForDeploy
): Promise<StakingContractFactory> {
  const StakingContractFactory = await ethers.getContractFactory(
    "StakingContractFactory",
    deployer
  );
  const stakingContractFactory = await StakingContractFactory.deploy(
    camoTokenAddress
  ) as StakingContractFactory;
  await ethers.provider.waitForTransaction(
    stakingContractFactory.deployTransaction.hash,
    confirmations
  );
  console.log(
    `\nStakingContractFactory deployed\n\tAt address: ${stakingContractFactory.address}`
  );
  return stakingContractFactory;
}

export async function deployTokenTimelock(
  deployer: Signer,
  camoTokenAddress: String,
  confirmations: number = config.confirmationsForDeploy
): Promise<TokenTimelock> {
  const tokenTimelockFactory = await ethers.getContractFactory(
    "contracts/TokenTimelock.sol:TokenTimelock",
    deployer
  );
  const tokenTimelock = await tokenTimelockFactory.deploy(camoTokenAddress) as TokenTimelock;
  await ethers.provider.waitForTransaction(
    tokenTimelock.deployTransaction.hash,
    confirmations
  );
  console.log(
    `\nTokenTimelock deployed\n\tAt address: ${tokenTimelock.address}`
  );
  return tokenTimelock;
}

export async function createStakingContract(
  stakingContractFactory: StakingContractFactory,
  staker: Signer,
  releaseTime: number
): Promise<StakingContract> {
  const createStakingContractHash = await stakingContractFactory
    .connect(staker)
    .newStakingContract(releaseTime);

  const receipt = await ethers.provider.waitForTransaction(
    createStakingContractHash.hash
  );
  for (const log of receipt.logs) {
    const parsedLog = stakingContractFactory.interface.parseLog(log);
    if (parsedLog.name == "StakingContractCreated") {
      const ownerAddress = parsedLog.args.creator;
      const stakingContractAddress = parsedLog.args.stakingContract;
      console.log(
        `\nStakingContract deployed\n\tAt address: ${stakingContractAddress}\n\tOwner: ${ownerAddress}`
      );
      return await ethers.getContractAt(
        "StakingContract",
        stakingContractAddress
      ) as StakingContract;
    }
  }
  throw new Error("Issuer creation transaction failed.");
}

export async function createNodeOperator(
  creator: Signer,
  name: string,
  nodeOperatorFactory: NodeOperatorFactory,
  stablecoin: string
): Promise<NodeOperator> {
  const nodeOperatorTxHash = await nodeOperatorFactory
    .connect(creator)
    .create(name, stablecoin);
  const receipt = await ethers.provider.waitForTransaction(
    nodeOperatorTxHash.hash
  );
  for (const log of receipt.logs) {
    const parsedLog = nodeOperatorFactory.interface.parseLog(log);
    if (parsedLog.name == "NodeOperatorCreated") {
      const ownerAddress = parsedLog.args.creator;
      const nodeOperatorAddress = parsedLog.args.nodeOperator;
      const issuerAddress = parsedLog.args.name;
      const stablecoin = parsedLog.args.stablecoin;
      console.log(
        `\nNodeOperator deployed\n\tAt address: ${nodeOperatorAddress}\n\tOwner: ${ownerAddress}\n\tStablecoin: ${stablecoin}`
      );
      return await ethers.getContractAt("NodeOperator", nodeOperatorAddress) as NodeOperator;
    }
  }
  throw new Error("Issuer creation transaction failed.");
}

export async function transferERC20Token(
  from: Signer,
  to: string,
  camoToken: CamoToken,
  amount: string
) {
  const amountWei = ethers.utils.parseEther(amount);
  await camoToken.connect(from).transfer(to, amountWei);
}

export async function approveSpendingCamoToken(
  from: Signer,
  stakingContract: StakingContract,
  amount: string
) {
  const amountWei = ethers.utils.parseEther(amount);
  // TODO: add approveSpendToken function to StakingContract
  // await stakingContract.connect(from).approveSpendToken(amountWei);
}

/*
   I could use => await camoToken.connect(staker).transfer(stakingContract.address, amount) but in that case I can only call that
   directly on the ERC-20 token. In case I want to adjust that logic into anything custom I need to use these two steps approve/transferFrom.
  */
export async function stake(
  staker: Signer,
  camoToken: CamoToken,
  stakingContract: StakingContract,
  amount: string
) {
  const amountWei = ethers.utils.parseEther(amount);
  await camoToken.connect(staker).approve(stakingContract.address, amountWei);
  await stakingContract.connect(staker).depositCamoTokens(amountWei);
}

export async function releaseStake(staker: Signer, stakingContract: StakingContract) {
  await stakingContract.connect(staker).release();
}

export async function getBlockTimestampInSeconds(): Promise<number> {
  const blockInfo = await ethers.provider.getBlock("latest");
  return blockInfo.timestamp;
}

export async function getBalance(
  token: ERC20,
  address: string
): Promise<string> {
  return ethers.utils.formatEther(await token.balanceOf(address));
}

export async function payToNode(
  payer: Signer,
  stablecoin: USDC,
  nodeOperator: NodeOperator,
  amount: string
) {
  const amountWei = ethers.utils.parseEther(amount);
  await stablecoin.connect(payer).approve(nodeOperator.address, amountWei);
  await nodeOperator.connect(payer).depositStablecoin(amountWei);
}

export async function registerProxy(proxy: Signer, nodeOperator: NodeOperator) {
  await nodeOperator.connect(proxy).registerProxy();
}

export async function payout(node: Signer, nodeOperator: NodeOperator) {
  await nodeOperator.connect(node).payout();
}

export async function getTimelockToken(owner: Signer, tokenTimelock: TokenTimelock) {
  await tokenTimelock.connect(owner).token();
}

export async function lock(
  owner: Signer,
  tokenTimelock: TokenTimelock,
  address: string,
  releaseTime: string,
  amount: string
) {
  const releaseTimeBN = BigNumber.from(releaseTime);
  const amountWei = ethers.utils.parseEther(amount);
  await tokenTimelock.connect(owner).lock(address, releaseTimeBN, amountWei);
}

export async function release(
  owner: Signer,
  tokenTimelock: TokenTimelock,
  address: string
) {
  await tokenTimelock.connect(owner).release(address);
}

export async function getBeneficiary(
  owner: Signer,
  tokenTimelock: TokenTimelock,
  address: string
): Promise<BeneficiaryData> {
  const beneficiaryData = await tokenTimelock
    .connect(owner)
    .beneficiaries(address);
  const amount: string = ethers.utils.formatEther(beneficiaryData.amount);
  const releaseTime: string = beneficiaryData.releaseTime.toString();
  return new BeneficiaryData(amount, releaseTime);
}

export class BeneficiaryData {
  amount: string;
  releaseTime: string;

  constructor(amount: string, releaseTime: string) {
    this.amount = amount;
    this.releaseTime = releaseTime;
  }
}
