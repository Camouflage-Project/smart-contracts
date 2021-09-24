import {ethers} from 'hardhat';
import {Contract, Signer} from 'ethers';
import * as helpers from '../util/helpers';

describe('Full test', function () {

    //////// FACTORIES ////////
  let nodeOperatorFactory: Contract;

  //////// SIGNERS ////////
  let deployer: Signer;
  let alice: Signer;

  //////// CONTRACTS ////////
  let nodeOperator: Contract;

  beforeEach(async function () {
    const accounts: Signer[] = await ethers.getSigners();
    
    deployer        = accounts[0];
    alice           = accounts[1];

    nodeOperatorFactory = await helpers.deployNodeOperatorFactory(deployer)
  });

  it(`should successfully complete the flow:\n
        1) Create two nodeOperators
  `, async function () {
        const aliceAddress = await alice.getAddress();
        await helpers.createNodeOperator(aliceAddress, 'ALice-Node-Operator', nodeOperatorFactory);

        const deployerAddress = await deployer.getAddress();
        await helpers.createNodeOperator(deployerAddress, 'My-Node-Operator', nodeOperatorFactory);
  })
});
