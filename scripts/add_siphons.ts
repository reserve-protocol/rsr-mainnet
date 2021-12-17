import { ethers } from "hardhat";
import hre from 'hardhat'
import { networkConfig } from '../common/configuration'
import { getChainId, isValidContract } from '../common/blockchain-utils'

import { SiphonSpell } from '../typechain'

let siphonSpell: SiphonSpell

const WEIGHT_ONE = 1000

async function main() {

  const [owner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }
  
  // Get Siphon spell
  let siphonAddress: string
  if (networkConfig[chainId].siphonSpell) {
    siphonAddress = networkConfig[chainId].siphonSpell as string
    const valid: boolean = await isValidContract(hre, siphonAddress)
    if(!valid){
        throw new Error(`Siphon Spell contract not found in network ${hre.network.name}`)
    }
} else {
    throw new Error(`Missing address for Siphon Spell in network ${hre.network.name}`)
  }
  
  // Get Siphon Spell
  siphonSpell = await ethers.getContractAt("SiphonSpell", siphonAddress)
  console.log("Siphon Spell retrieved from address to:", siphonSpell.address);

  // Add Siphons_planSiphons
  // Note: Deployer address is assumed to be the one that deployed the spell
  await siphonSpell.connect(owner).planSiphon('0xd282337950Ac6e936D0F0eBAaFf1Ffc3dE79F3d5', { to: '0x5f84660Cabb98F7b7764cD1AE2553442Da91984E', weight: WEIGHT_ONE / 2})
  await siphonSpell.connect(owner).planSiphon('0x9e454Fe7d8e087fcac4ec8c40562dE781004477E', { to: '0xeFbAaF73FC22f70785515C1e2Be3d5ba2Fb8E9B0', weight: WEIGHT_ONE / 2 })
  // ... add as required

  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Siphons added successfully to spell ${siphonSpell.address} on network ${hre.network.name} (${chainId})\n`)
  console.log('********************************************************************')

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
