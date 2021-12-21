import hre from 'hardhat'
import { getChainId } from '../../common/blockchain-utils'
import { networkConfig, developmentChains } from '../../common/configuration'
import { IDeployments, getDeploymentFilename, getDeploymentFile } from './deployment_utils'

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
  const rsrPrevAddr: string = deploymentsData.rsrPrev

  console.time('Verifying RSR contract ...')
  await hre.run('verify:verify', {
    address: rsrAddr,
    constructorArguments: [rsrPrevAddr],
    contract: 'contracts/RSR.sol:RSR',
  })
  console.timeEnd('Verifying RSR contract ...')

  /** ******************** Verify Upgrade Spell ****************************************/
  // Verify contract in Etherscan
  const upgradeSpellAddr: string = deploymentsData.upgradeSpell

  console.time('Verifying UpgradeSpell contract ...')
  await hre.run('verify:verify', {
    address: upgradeSpellAddr,
    constructorArguments: [rsrPrevAddr, rsrAddr],
    contract: 'contracts/UpgradeSpell.sol:UpgradeSpell',
  })
  console.timeEnd('Verifying UpgradeSpell contract ...')
  /**************************************************************************/

  console.log('*********************************************************************')
  console.log(`Verifications completed successfully on network ${hre.network.name} (${chainId})\n`)
  console.log(`RSR:  ${rsrAddr}`)
  console.log(`UpgradeSpell:  ${upgradeSpellAddr}`)
  console.log('********************************************************************')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
