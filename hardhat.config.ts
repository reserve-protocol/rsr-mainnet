import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

import * as dotenv from 'dotenv'
import { HardhatUserConfig } from 'hardhat/config'

dotenv.config()

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || ''
const ROPSTEN_RPC_URL = process.env.ROPSTEN_RPC_URL || ''
const MNEMONIC = process.env.MNEMONIC || ''

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: '0.8.4', settings: { optimizer: { enabled: true, runs: 100000 } } },
      { version: '0.5.8', settings: { optimizer: { enabled: true, runs: 10 } } },
      { version: '0.4.24', settings: { optimizer: { enabled: true, runs: 100000 } } },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_RPC_URL,
        blockNumber: 13998722,
        enabled: process.env.FORK !== undefined,
      },
      // gas: 'auto',
      gasPrice: 150000000000, // 120 gwei
    },
    ropsten: {
      chainId: 3,
      url: ROPSTEN_RPC_URL,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    mainnet: {
      chainId: 1,
      url: MAINNET_RPC_URL,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 60000,
  },
}

export default config
