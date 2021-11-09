import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import * as helpers from "../util/helpers";
import { expect } from "chai";

/* global describe, it, beforeEach */
describe("Full test", function () {
  // ////// FACTORIES ////////
  let nodeOperatorFactory: Contract;

  // ////// SIGNERS ////////
  let deployer: Signer;
  let alice: Signer;
  let johnScraper: Signer;
  let proxy1: Signer;
  let proxy2: Signer;

  // ////// ADDRESSES ////////
  let deployerAddress: string;
  let aliceAddress: string;
  let johnScraperAddress: string;
  let proxy1Address: string;
  let proxy2Address: string;

  // ////// CONTRACTS ////////
  let camoToken: Contract;
  let stakingContractFactory: Contract;
  let stablecoin: Contract;

  beforeEach(async function () {
    const accounts: Signer[] = await ethers.getSigners();

    // ////// SIGNERS ////////
    deployer = accounts[0];
    alice = accounts[1];
    johnScraper = accounts[2];
    proxy1 = accounts[3];
    proxy2 = accounts[4];

    // ////// ADDRESSES ////////
    deployerAddress = await deployer.getAddress();
    aliceAddress = await alice.getAddress();
    johnScraperAddress = await johnScraper.getAddress();
    proxy1Address = await proxy1.getAddress();
    proxy2Address = await proxy2.getAddress();

    camoToken = await helpers.deployCamoToken(
      deployer,
      "Camouflage Protocol",
      "Camo",
      "1000000"
    );
    stablecoin = await helpers.deployStablecoin(deployer, "1000000");
    stakingContractFactory = await helpers.deployStakingContractFactory(
      deployer,
      camoToken.address
    );
    nodeOperatorFactory = await helpers.deployNodeOperatorFactory(
      deployer,
      camoToken.address,
      stakingContractFactory.address
    );
  });

  it(`should successfully complete the flow`, async function () {
    console.log(
      `Signers are: \n\tMain deployer: ${deployerAddress}\n\tAlice: ${aliceAddress}`
    );

    // Deployer has all the supply of Camo token, he transfers 1000 Camo tokens to Alice.
    await helpers.transferERC20Token(deployer, aliceAddress, camoToken, "1000");
    console.log(
      `Deployers balance of Camo is: ${await helpers.getBalance(
        camoToken,
        deployerAddress
      )}`
    );
    console.log(
      `Alices balance of Camo is: ${await helpers.getBalance(
        camoToken,
        aliceAddress
      )}`
    );

    // Alice stakes 600 Camo Tokens in order to become a node operator
    const aliceStakingContract = await helpers.createStakingContract(
      stakingContractFactory,
      alice,
      (await helpers.getBlockTimestampInSeconds()) + 7
    );
    await helpers.stake(alice, camoToken, aliceStakingContract, "600");
    await helpers.stake(alice, camoToken, aliceStakingContract, "100");
    console.log(
      `Alices balance of Camo after stake is: ${await helpers.getBalance(
        camoToken,
        aliceAddress
      )}`
    );
    console.log(
      `Staking contract balance of Camo after stake is: ${await helpers.getBalance(
        camoToken,
        aliceStakingContract.address
      )}`
    );

    // Alice cannot release token before release time expires. In hardhat the default config is that each new transaction is a new block mined.
    await expect(
      helpers.releaseStake(alice, aliceStakingContract)
    ).to.be.revertedWith("TokenTimelock: current time is before release time");
    await helpers.releaseStake(alice, aliceStakingContract);
    console.log(
      `Alices balance of Camo after release is: ${await helpers.getBalance(
        camoToken,
        aliceAddress
      )}`
    );
    console.log(
      `Staking contract balance of Camo after release is: ${await helpers.getBalance(
        camoToken,
        aliceStakingContract.address
      )}`
    );
    await helpers.stake(alice, camoToken, aliceStakingContract, "600");

    // Deployer stakes 600 Camo Tokens in order to become a node operator
    const deployerStakingContract = await helpers.createStakingContract(
      stakingContractFactory,
      deployer,
      (await helpers.getBlockTimestampInSeconds()) + 3
    );
    await helpers.stake(deployer, camoToken, deployerStakingContract, "500");
    console.log(
      `Deployers balance of Camo after stake is: ${await helpers.getBalance(
        camoToken,
        deployerAddress
      )}`
    );
    console.log(
      `Staking contract balance of Camo after stake is: ${await helpers.getBalance(
        camoToken,
        deployerStakingContract.address
      )}`
    );

    const aliceNodeOperator: Contract = await helpers.createNodeOperator(
      alice,
      "Alice-Node-Operator",
      nodeOperatorFactory,
      stablecoin.address
    );
    const deployerNodeOperator: Contract = await helpers.createNodeOperator(
      deployer,
      "My-Node-Operator",
      nodeOperatorFactory,
      stablecoin.address
    );

    // 2 proxies attach to alice's node.
    await helpers.registerProxy(proxy1, aliceNodeOperator);
    await helpers.registerProxy(proxy2, aliceNodeOperator);

    // John wants to scrape the web and chooses alice's node
    const usdcHolding = "1000.0";
    const payment: string = "900.0";
    await helpers.transferERC20Token(
      deployer,
      johnScraperAddress,
      stablecoin,
      usdcHolding
    );
    await helpers.payToNode(
      johnScraper,
      stablecoin,
      aliceNodeOperator,
      payment
    );
    expect(
      await helpers.getBalance(stablecoin, aliceNodeOperator.address)
    ).to.equal(payment);
    expect(await helpers.getBalance(stablecoin, johnScraperAddress)).to.equal(
      "100.0"
    );

    // Alice initiates payout proccess
    await helpers.payout(alice, aliceNodeOperator);
    expect(await helpers.getBalance(stablecoin, aliceAddress)).to.equal(
      "450.0"
    );
    expect(await helpers.getBalance(stablecoin, proxy1Address)).to.equal(
      "225.0"
    );
    expect(await helpers.getBalance(stablecoin, proxy2Address)).to.equal(
      "225.0"
    );
    expect(
      await helpers.getBalance(stablecoin, aliceNodeOperator.address)
    ).to.equal("0.0");

    // Other node cannot call alice's payout function
    await expect(
      helpers.payout(deployer, aliceNodeOperator)
    ).to.be.revertedWith("You are not the owner of this Node Operator");
  });
});
