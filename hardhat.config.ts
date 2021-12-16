import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

import * as dotenv from 'dotenv'
import { HardhatUserConfig, task } from 'hardhat/config'

dotenv.config()

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || ''
const ROPSTEN_RPC_URL = process.env.ROPSTEN_RPC_URL || ''
const MNEMONIC = process.env.MNEMONIC || ''

console.log(MAINNET_RPC_URL)
console.log(ROPSTEN_RPC_URL)

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: '0.8.4', settings: { optimizer: { enabled: true, runs: 100000 } } },
      { version: '0.5.8', settings: { optimizer: { enabled: true, runs: 100000 } } },
      { version: '0.4.24', settings: { optimizer: { enabled: true, runs: 100000 } } },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_RPC_URL,
        blockNumber: 13810440,
        enabled: process.env.FORK !== undefined ? true : false,
      },
      gas: 'auto',
    },
    ropsten: {
      chainId: 3,
      url: ROPSTEN_RPC_URL,
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
}

export default config

