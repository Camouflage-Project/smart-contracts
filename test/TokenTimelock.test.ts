import {ethers} from 'hardhat';
import { Contract, Signer } from "ethers";
import * as helpers from "../util/helpers";
import {expect} from 'chai';
import {time, expectRevert} from '@openzeppelin/test-helpers'

describe("Test full token timelock flow", function () {

  let deployer: Signer;
  let beneficiary1: Signer;
  let beneficiary2: Signer;

  let deployerAddress: string;
  let beneficiary1Address: string;
  let beneficiary2Address: string;

  let camoToken: Contract;
  let timelock: Contract;

  beforeEach(async function () {

    [deployer, beneficiary1, beneficiary2] = await ethers.getSigners();

    deployerAddress = await deployer.getAddress();
    beneficiary1Address = await beneficiary1.getAddress();
    beneficiary2Address = await beneficiary2.getAddress();

    camoToken = await helpers.deployCamoToken(
      deployer,
      "Camouflage Protocol",
      "Camo",
      "1000000"
    );

    timelock = await helpers.deployTokenTimelock(
      deployer,
      camoToken.address
    );

    await helpers.transferERC20Token(deployer, timelock.address, camoToken, "10000");
  
  });

  describe("Once deployed", function () {


    it("Only owner can call lock", async function () {
      await expectRevert(helpers.lock(beneficiary1, timelock, beneficiary2Address, '0', '0'), 'TokenTimelock: this function can only be called by the owner');
    });

    it("Rejects a release time in the past", async function () {
      const pastReleaseTime: number = (await time.latest()).sub(time.duration.years(1));
      await expectRevert(helpers.lock(deployer, timelock, beneficiary1Address, pastReleaseTime.toString(), '10000'), 'TokenTimelock: release time is before current time');
    });

    it("Rejects amount that is greater than the contract balance", async function () {
      const releaseTime: number = (await time.latest()).add(time.duration.years(1));
      await expectRevert(helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), '10001'), 'TokenTimelock: amount is greater than the contract balance');
    });

    it("Rejects amount that is 0 or less", async function () {
      const releaseTime: number = (await time.latest()).add(time.duration.years(1));
      await expectRevert(helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), '0'), 'TokenTimelock: amount is 0 or less');
    });

    it("Locks tokens for beneficiary", async function () {
      const releaseTime = (await time.latest()).add(time.duration.years(1));
      const amount = '10000'
      await helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), amount);
      const beneficiaryData: helpers.BeneficiaryData = await helpers.getBeneficiary(deployer, timelock, beneficiary1Address);
      expect(+beneficiaryData.amount).to.equal(+amount);
      expect(+beneficiaryData.releaseTime).to.equal(releaseTime.toNumber());
    });

    it("Locks tokens for multiple beneficiaries", async function () {
      const releaseTime1 = (await time.latest()).add(time.duration.years(1));
      const releaseTime2 = (await time.latest()).add(time.duration.years(2));
      const amount1 = '5000'
      const amount2 = '3000'
      await helpers.lock(deployer, timelock, beneficiary1Address, releaseTime1.toString(), amount1);
      await helpers.lock(deployer, timelock, beneficiary2Address, releaseTime2.toString(), amount2);
      const beneficiaryData1: helpers.BeneficiaryData = await helpers.getBeneficiary(deployer, timelock, beneficiary1Address);
      const beneficiaryData2: helpers.BeneficiaryData = await helpers.getBeneficiary(deployer, timelock, beneficiary2Address);
      expect(+beneficiaryData1.amount).to.equal(+amount1);
      expect(+beneficiaryData1.releaseTime).to.equal(releaseTime1.toNumber());
      expect(+beneficiaryData2.amount).to.equal(+amount2);
      expect(+beneficiaryData2.releaseTime).to.equal(releaseTime2.toNumber());
    });

    it("Rejects release before time limit", async function () {
      const releaseTime = (await time.latest()).add(time.duration.years(1));
      const amount = '10000'
      await helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), amount);
      await expectRevert(helpers.release(deployer, timelock, beneficiary1Address), 'TokenTimelock: current time is before release time');
    });

    it("Rejects release just before time limit", async function () {
      const releaseTime = (await time.latest()).add(time.duration.seconds(3));
      const amount = '10000'
      await helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), amount);
      await expectRevert(helpers.release(deployer, timelock, beneficiary1Address), 'TokenTimelock: current time is before release time');
    });

    it("Rejects release just before time limit", async function () {
      const releaseTime = (await time.latest()).add(time.duration.seconds(3));
      const amount = '10000'
      await helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), amount);
      await expectRevert(helpers.release(deployer, timelock, beneficiary1Address), 'TokenTimelock: current time is before release time');
    });

    it("Releases tokens for beneficiary", async function () {
      const releaseTime = (await time.latest()).add(time.duration.seconds(2));
      const amount = '10000'
      await helpers.lock(deployer, timelock, beneficiary1Address, releaseTime.toString(), amount);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await helpers.release(deployer, timelock, beneficiary1Address);
      const deletedBeneficiaryData: helpers.BeneficiaryData = await helpers.getBeneficiary(deployer, timelock, beneficiary1Address);
      expect(+(await helpers.getBalance(camoToken, beneficiary1Address))).to.equal(+amount);
      expect(+deletedBeneficiaryData.amount).to.equal(0);
      expect(+deletedBeneficiaryData.releaseTime).to.equal(0);
    });
  });
});