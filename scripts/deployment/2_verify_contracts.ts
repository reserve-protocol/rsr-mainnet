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

  /** ******************** Verify RSR contract ****************************************/
  console.time('Verifying RSR')
  await hre.run('verify:verify', {
    address: deployments.rsr,
    constructorArguments: [deployments.oldRSR],
    contract: 'contracts/RSR.sol:RSR',
  })
  console.timeEnd('Verifying RSR')

  /** ******************** Verify Fork Spell ****************************************/
  console.time('Verifying ForkSpell')
  await hre.run('verify:verify', {
    address: deployments.forkSpell,
    constructorArguments: [deployments.oldRSR, deployments.rsr],
    contract: 'contracts/ForkSpell.sol:ForkSpell',
  })
  console.timeEnd('Verifying ForkSpell')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
