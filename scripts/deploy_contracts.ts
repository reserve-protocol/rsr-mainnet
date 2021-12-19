import { ethers } from 'hardhat'
import hre from 'hardhat'

import { getChainId, isValidContract } from '../common/blockchain-utils'
import { networkConfig } from '../common/configuration'
import { RSR, SiphonSpell, UpgradeSpell } from '../typechain'
import { UPGRADE_SIPHONS } from './siphon_config'

let rsrToken: RSR
let siphonSpell: SiphonSpell
let upgradeSpell: UpgradeSpell

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  console.log(`Starting deployment on network ${hre.network.name} (${chainId})`)
  console.log(`Deployer account: ${deployer.address}\n`)

  /********************** Deploy RSR ****************************************/
  // Get previous RSR Address
  let previousRSRAddr: string

  if (networkConfig[chainId].rsrPrev) {
    previousRSRAddr = networkConfig[chainId].rsrPrev as string
    const valid: boolean = await isValidContract(hre, previousRSRAddr)
    if (!valid) {
      throw new Error(`Previous RSR contract not found in network ${hre.network.name}`)
    }
  } else {
    throw new Error(`Missing address for previous RSR in network ${hre.network.name}`)
  }

  // Deploy RSR
  const RSR = await ethers.getContractFactory('RSR')
  rsrToken = <RSR>await RSR.deploy(previousRSRAddr)
  await rsrToken.deployed()

  console.log('RSR deployed to:', rsrToken.address)

  /********************** Deploy Siphon Spell ****************************************/

  // Note: For now, setting deployer account as owner to add new siphons later
  const SiphonSpellfactory = await ethers.getContractFactory('SiphonSpell')
  siphonSpell = <SiphonSpell>await SiphonSpellfactory.deploy(rsrToken.address, UPGRADE_SIPHONS)
  await siphonSpell.deployed()

  console.log('Siphon Spell deployed to:', siphonSpell.address)

  /********************** Deploy Upgrade Spell ****************************************/
  const UpgradeSpellFactory = await ethers.getContractFactory('UpgradeSpell')
  upgradeSpell = <UpgradeSpell>await UpgradeSpellFactory.deploy(previousRSRAddr, rsrToken.address)
  await upgradeSpell.deployed()

  console.log('Upgrade Spell deployed to:', upgradeSpell.address)

  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Deployments completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`RSR:  ${rsrToken.address}`)
  console.log(`SiphonSpell:  ${siphonSpell.address}`)
  console.log(`   -> Owner set to:  ${deployer.address}`)
  console.log(`UpgradeSpell:  ${upgradeSpell.address}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
