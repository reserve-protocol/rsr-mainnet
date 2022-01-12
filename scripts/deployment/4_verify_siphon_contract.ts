import hre from 'hardhat'

import { getChainId } from '../../common/blockchain-utils'
import { developmentChains, networkConfig } from '../../common/configuration'
import { getDeploymentFile, getDeploymentFilename, IDeployments } from './deployment_utils'
import { UPGRADE_SIPHONS } from './siphon_config'

let deployments: IDeployments

async function main() {
  const chainId = await getChainId(hre)
  // ********** Read config **********
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  if (developmentChains.includes(hre.network.name)) {
    throw new Error(`Cannot verify contracts for development chain ${hre.network.name}`)
  }

  deployments = getDeploymentFile(getDeploymentFilename(chainId))

  /** ******************** Verify Siphon Spell ****************************************/
  if (deployments.siphonSpell) {
    console.time('Verifying SiphonSpell')
    await hre.run('verify:verify', {
      address: deployments.siphonSpell,
      constructorArguments: [deployments.rsr, UPGRADE_SIPHONS],
      contract: 'contracts/SiphonSpell.sol:SiphonSpell',
    })
    console.timeEnd('Verifying SiphonSpell')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
