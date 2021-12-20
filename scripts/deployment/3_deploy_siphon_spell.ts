import fs from 'fs'
import { ethers } from 'hardhat'
import hre from 'hardhat'
import { getChainId, isValidContract } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { IDeployments, fileExists, getDeploymentFilename } from './deployment_utils'
import { SiphonSpell } from '../../typechain'
import { UPGRADE_SIPHONS } from './siphon_config'

let siphonSpell: SiphonSpell

let deploymentsData: IDeployments

async function main() {
  const [alice] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  console.log(`Starting deployment on network ${hre.network.name} (${chainId})`)
  console.log(`Deployer account: ${alice.address}\n`)

  // Get RSR address and contract
  const tmpDeploymentFile = getDeploymentFilename(chainId)
  if (await fileExists(tmpDeploymentFile)) {
    const data: string = (await fs.promises.readFile(tmpDeploymentFile)).toString()
    deploymentsData = JSON.parse(data)
  } else {
    throw new Error(
      `Deployment File does not exist for network ${hre.network.name} (${chainId}). Please make sure contracts are deployed and this file is properly generated.`
    )
  }

  const rsrAddr: string = deploymentsData.rsr
  if (rsrAddr != '') {
    const valid: boolean = await isValidContract(hre, rsrAddr)
    if (!valid) {
      throw new Error(`RSR contract not found in network ${hre.network.name}`)
    }
  } else {
    throw new Error(`Missing address for RSR in network ${hre.network.name}`)
  }

  /********************** Deploy Siphon Spell ****************************************/

  // Note: For now, setting deployer account as owner to add new siphons later
  const SiphonSpellfactory = await ethers.getContractFactory('SiphonSpell')
  siphonSpell = <SiphonSpell>await SiphonSpellfactory.deploy(rsrAddr, UPGRADE_SIPHONS)
  await siphonSpell.deployed()

  console.log('Siphon Spell deployed to:', siphonSpell.address)

  deploymentsData.siphonSpell = siphonSpell.address
 
  /**************************************************************************/
 
  // Write temporary deployments file
  await fs.promises.writeFile(
    tmpDeploymentFile,
    JSON.stringify(deploymentsData, null, 2)
  )

  console.log('*********************************************************************')
  console.log(`Deployments completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`SiphonSpell:  ${siphonSpell.address}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
