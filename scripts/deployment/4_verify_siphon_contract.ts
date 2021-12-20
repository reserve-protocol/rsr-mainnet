import fs from 'fs'
import hre from 'hardhat'
import { getChainId } from '../../common/blockchain-utils'
import { networkConfig, developmentChains } from '../../common/configuration'
import { IDeployments, fileExists, getDeploymentFilename } from './deployment_utils'
import { UPGRADE_SIPHONS } from './siphon_config'

let deploymentsData: IDeployments

async function main() {
  const chainId = await getChainId(hre)

  const verify: boolean = developmentChains.includes(hre.network.name) ? false : true

  // Check if chain is supported
  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  if (!verify) {
    throw new Error(`Cannot verify contracts for development chain ${hre.network.name}`)
  }

  // Check if deployment file exists for this chainId
  const tmpDeploymentFile = getDeploymentFilename(chainId)
  if (await fileExists(tmpDeploymentFile)) {
    const data: string = (await fs.promises.readFile(tmpDeploymentFile)).toString()
    deploymentsData = JSON.parse(data)
  } else {
    throw new Error(
      `Deployment File does not exist for network ${hre.network.name} (${chainId}). Please make sure contracts are deployed and this file is properly generated.`
    )
  }

  console.log(`Starting contract verification on network ${hre.network.name} (${chainId})`)

  /********************** Verify Siphon Spell ****************************************/
  // Verify contract in Etherscan
  const rsrAddr: string = deploymentsData.rsr
  const siphonSpellAddr: string = deploymentsData.siphonSpell

  if (siphonSpellAddr != '') {
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
