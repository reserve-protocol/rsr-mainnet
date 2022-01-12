import hre from 'hardhat'

import { getChainId } from '../../common/blockchain-utils'
import { developmentChains, networkConfig } from '../../common/configuration'
import { getDeploymentFile, getDeploymentFilename, IDeployments } from './deployment_utils'

let deployments: IDeployments

async function main() {
  // ********** Read config **********
  const chainId = await getChainId(hre)
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  if (developmentChains.includes(hre.network.name)) {
    throw new Error(`Cannot verify contracts for development chain ${hre.network.name}`)
  }

  deployments = getDeploymentFile(getDeploymentFilename(chainId))

  /** ******************** Verify SlowWallet contract ****************************************/
  // Get CompanySafe address
  const companySafeAddr = networkConfig[chainId].companySafe
  if (!companySafeAddr) {
    throw new Error(`Missing address for CompanySafe in network ${hre.network.name}`)
  }

  console.time('Verifying SlowWallet')
  await hre.run('verify:verify', {
    address: deployments.slowWallet,
    constructorArguments: [deployments.rsr, companySafeAddr],
    contract: 'contracts/test/SlowWallet.sol:SlowWallet',
  })
  console.timeEnd('Verifying SlowWallet')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
