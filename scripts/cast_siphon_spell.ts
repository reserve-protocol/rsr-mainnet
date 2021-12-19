import { ethers } from 'hardhat'
import hre from 'hardhat'

import { getChainId, isValidContract } from '../common/blockchain-utils'
import { networkConfig } from '../common/configuration'
import { RSR } from '../typechain'

let rsrToken: RSR

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
    if (!valid) {
      throw new Error(`Siphon Spell contract not found in network ${hre.network.name}`)
    }
  } else {
    throw new Error(`Missing address for Siphon Spell in network ${hre.network.name}`)
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
  await rsrToken.connect(owner).castSpell(siphonAddress)

  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(
    `Siphons spell ${siphonAddress} casted for RSR ${rsrToken.address} on network ${hre.network.name} (${chainId})\n`
  )
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
