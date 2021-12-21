import hre from 'hardhat'
import { getChainId } from '../../common/blockchain-utils'
import { networkConfig, developmentChains } from '../../common/configuration'
import { IDeployments, getDeploymentFilename, getDeploymentFile } from './deployment_utils'
import { UPGRADE_SIPHONS } from './siphon_config'

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

  /** ******************** Verify Siphon Spell ****************************************/
  // Verify contract in Etherscan
  const rsrAddr = deploymentsData.rsr
  const siphonSpellAddr = deploymentsData.siphonSpell

  if (siphonSpellAddr) {
    console.time('Verifying SiphonSpell contract ...')
    await hre.run('verify:verify', {
      address: siphonSpellAddr,
      constructorArguments: [rsrAddr, UPGRADE_SIPHONS],
      contract: 'contracts/SiphonSpell.sol:SiphonSpell',
    })
    console.timeEnd('Verifying SiphonSpell contract ...')
  }
  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Verifications completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`SiphonSpell:  ${siphonSpellAddr}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
