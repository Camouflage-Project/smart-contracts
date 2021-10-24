import {task} from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import 'hardhat-gas-reporter';
import 'hardhat-contract-sizer';
import * as dotenv from 'dotenv';
dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
    },
    goerli: {
      url: process.env.GOERLI_RPC,
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
    },
    eth_mainnet: {
      url: process.env.ETH_MAINNET_RPC,
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
    },
    matic_mainnet: {
      url: process.env.MATIC_RPC,
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
    },
  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
  },
};
