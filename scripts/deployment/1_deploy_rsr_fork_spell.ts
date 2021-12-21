import fs from 'fs'
import hre, { ethers } from 'hardhat'

import { getChainId, isValidContract } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { ForkSpell, RSR } from '../../typechain'
import { fileExists, getDeploymentFilename, IDeployments } from './deployment_utils'

let rsrToken: RSR
let forkSpell: ForkSpell

const deploymentsData: IDeployments = { oldRSR: '', rsr: '', forkSpell: '', siphonSpell: '' }

async function main() {
  const [alice] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  // Check if deployment file already exists for this chainId
  const tmpDeploymentFile = getDeploymentFilename(chainId)
  if (fileExists(tmpDeploymentFile)) {
    throw new Error(
      `File already exists for network ${hre.network.name} (${chainId}). Please delete this file and run again if required.`
    )
  }

  console.log(`Starting deployment on network ${hre.network.name} (${chainId})`)
  console.log(`Deployer Alice account: ${alice.address}\n`)

  /** ******************** Deploy RSR ****************************************/
  // Get previous RSR Address
  let previousRSRAddr: string

  if (networkConfig[chainId].oldRSR) {
    previousRSRAddr = networkConfig[chainId].oldRSR as string
    const valid: boolean = await isValidContract(hre, previousRSRAddr)
    if (!valid) {
      throw new Error(`Previous RSR contract not found in network ${hre.network.name}`)
    }
  } else {
    throw new Error(`Missing address for previous RSR in network ${hre.network.name}`)
  }

  // Check CompanySafe address is defined
  let companySafeAddr: string

  if (networkConfig[chainId].companySafe) {
    companySafeAddr = networkConfig[chainId].companySafe as string
  } else {
    throw new Error(`Missing address for CompanySafe in network ${hre.network.name}`)
  }

  // Deploy RSR
  const RSR = await ethers.getContractFactory('RSR')
  rsrToken = <RSR>await RSR.connect(alice).deploy(previousRSRAddr)
  await rsrToken.deployed()

  console.log('RSR deployed to:', rsrToken.address)

  deploymentsData.oldRSR = previousRSRAddr
  deploymentsData.rsr = rsrToken.address

  // Transfer Ownership
  await rsrToken.connect(alice).transferOwnership(companySafeAddr)
  await rsrToken.connect(alice).changePauser(companySafeAddr)

  /** ******************** Deploy Fork Spell ****************************************/
  const ForkSpellFactory = await ethers.getContractFactory('ForkSpell')
  forkSpell = <ForkSpell>await ForkSpellFactory.deploy(previousRSRAddr, rsrToken.address)
  await forkSpell.deployed()

  console.log('Fork Spell deployed to:', forkSpell.address)

  deploymentsData.forkSpell = forkSpell.address
  /**************************************************************************/
  // Write temporary deployments file
  fs.writeFileSync(tmpDeploymentFile, JSON.stringify(deploymentsData, null, 2))

  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Deployments completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`RSR:  ${rsrToken.address}`)
  console.log(`   -> Ownership set to:  ${companySafeAddr}`)
  console.log(`ForkSpell:  ${forkSpell.address}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
