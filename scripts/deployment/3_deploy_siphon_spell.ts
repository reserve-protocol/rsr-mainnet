import fs from 'fs'
import hre, { ethers } from 'hardhat'
import { getChainId, isValidContract } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { IDeployments, getDeploymentFile, getDeploymentFilename } from './deployment_utils'
import { SiphonSpell } from '../../typechain'
import { UPGRADE_SIPHONS } from './siphon_config'

let siphonSpell: SiphonSpell

let deploymentsData: IDeployments

async function main() {
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  console.log(`Starting deployment on network ${hre.network.name} (${chainId})`)
  console.log(`Deployer account: ${burner.address}\n`)

  // Get RSR address and contract
  const tmpDeploymentFile = getDeploymentFilename(chainId)
  deploymentsData = getDeploymentFile(tmpDeploymentFile, chainId)

  const rsrAddr: string = deploymentsData.rsr
  if (rsrAddr) {
    const valid: boolean = await isValidContract(hre, rsrAddr)
    if (!valid) {
      throw new Error(`RSR contract not found in network ${hre.network.name}`)
    }
  } else {
    throw new Error(`Missing address for RSR in network ${hre.network.name}`)
  }

  /** ******************** Deploy Siphon Spell ****************************************/
  const SiphonSpellfactory = await ethers.getContractFactory('SiphonSpell')
  siphonSpell = <SiphonSpell>await SiphonSpellfactory.deploy(rsrAddr, UPGRADE_SIPHONS)
  await siphonSpell.deployed()

  console.log('Siphon Spell deployed to:', siphonSpell.address)

  // Set value for file
  deploymentsData.siphonSpell = siphonSpell.address

  /**************************************************************************/

  // Write temporary deployments file
  fs.writeFileSync(tmpDeploymentFile, JSON.stringify(deploymentsData, null, 2))

  console.log('*********************************************************************')
  console.log(`Deployments completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`SiphonSpell:  ${siphonSpell.address}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
