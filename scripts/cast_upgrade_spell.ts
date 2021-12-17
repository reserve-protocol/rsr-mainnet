import { ethers } from "hardhat";
import hre from 'hardhat'
import { networkConfig } from '../common/configuration'
import { getChainId, isValidContract } from '../common/blockchain-utils'

import { RSR } from '../typechain'

let rsrToken: RSR

async function main() {

  const [owner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }
  
  // Get Upgrade spell
  let upgradeAddress: string
  if (networkConfig[chainId].upgradeSpell) {
    upgradeAddress = networkConfig[chainId].upgradeSpell as string
    const valid: boolean = await isValidContract(hre, upgradeAddress)
    if(!valid){
        throw new Error(`Upgrade Spell contract not found in network ${hre.network.name}`)
    }
} else {
    throw new Error(`Missing address for Upgrade Spell in network ${hre.network.name}`)
  }

  // Get RSR 
  let rsrAddr: string

  if (networkConfig[chainId].rsr) {
    rsrAddr = networkConfig[chainId].rsr as string
    const valid: boolean = await isValidContract(hre, rsrAddr)
    if (!valid) {
      throw new Error(`RSR contract not found in network ${hre.network.name}`)
    }
  } else {
    throw new Error(`Missing address for RSR in network ${hre.network.name}`)
  }

  // Get RSR
  rsrToken = <RSR>await ethers.getContractAt('RSR', rsrAddr)
  
  // Cast Siphon Spell on RSR
  await rsrToken.connect(owner).castSpell(upgradeAddress)

  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Upgrade spell ${upgradeAddress} casted for RSR ${rsrToken.address} on network ${hre.network.name} (${chainId})\n`)
  console.log('********************************************************************')

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
