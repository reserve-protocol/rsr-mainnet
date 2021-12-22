import fs from 'fs'
import hre, { ethers } from 'hardhat'
import { getChainId, isValidContract } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { getDeploymentFile, getDeploymentFilename } from './deployment_utils'
import { SiphonSpell } from '../../typechain'
import { UPGRADE_SIPHONS } from './siphon_config'

async function main() {
  // ==== Read Configuration ====
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  console.log(`Deploying SiphonSpell to network ${hre.network.name} (${chainId})
    with burner account: ${burner.address}`)

  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  const deploymentFilename = getDeploymentFilename(chainId)
  const deployments = getDeploymentFile(deploymentFilename, chainId)

  if (!deployments.rsr) {
    throw new Error(`Missing address for RSR in network ${hre.network.name}`)
  } else if (!(await isValidContract(hre, deployments.rsr))) {
    throw new Error(`RSR contract not found in network ${hre.network.name}`)
  }

  // ******************** Deploy Siphon Spell ****************************************/
  const SiphonSpellFactory = await ethers.getContractFactory('SiphonSpell')
  const siphonSpell = <SiphonSpell>await SiphonSpellFactory.deploy(deployments.rsr, UPGRADE_SIPHONS)
  await siphonSpell.deployed()

  // Write temporary deployments file
  deployments.siphonSpell = siphonSpell.address
  fs.writeFileSync(deploymentFilename, JSON.stringify(deployments, null, 2))

  console.log(`Deployed to ${hre.network.name} (${chainId})
    SiphonSpell:  ${siphonSpell.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
