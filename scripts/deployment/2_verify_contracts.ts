import hre from 'hardhat'

import { getChainId } from '../../common/blockchain-utils'
import { developmentChains, networkConfig } from '../../common/configuration'
import { getDeploymentFile, getDeploymentFilename, IDeployments } from './deployment_utils'

let deploymentsData: IDeployments

async function main() {
  const chainId = await getChainId(hre)
  const verify = !developmentChains.includes(hre.network.name)

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  if (!verify) {
    throw new Error(`Cannot verify contracts for development chain ${hre.network.name}`)
  }

  // Check if deployment file exists for this chainId
  const tmpDeploymentFile = getDeploymentFilename(chainId)
  deploymentsData = getDeploymentFile(tmpDeploymentFile, chainId)

  console.log(`Starting contract verification on network ${hre.network.name} (${chainId})`)

  /** ******************** Verify RSR contract ****************************************/
  // Verify contract in Etherscan
  const rsrAddr: string = deploymentsData.rsr
  const oldRSRAddr: string = deploymentsData.oldRSR

  console.time('Verifying RSR contract ...')
  await hre.run('verify:verify', {
    address: rsrAddr,
    constructorArguments: [oldRSRAddr],
    contract: 'contracts/RSR.sol:RSR',
  })
  console.timeEnd('Verifying RSR contract ...')

  /** ******************** Verify Fork Spell ****************************************/
  // Verify contract in Etherscan
  const forkSpellAddr: string = deploymentsData.forkSpell

  console.time('Verifying ForkSpell contract ...')
  await hre.run('verify:verify', {
    address: forkSpellAddr,
    constructorArguments: [oldRSRAddr, rsrAddr],
    contract: 'contracts/ForkSpell.sol:ForkSpell',
  })
  console.timeEnd('Verifying ForkSpell contract ...')
  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Verifications completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`RSR:  ${rsrAddr}`)
  console.log(`ForkSpell:  ${forkSpellAddr}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
