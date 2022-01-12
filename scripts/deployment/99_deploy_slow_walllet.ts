import fs from 'fs'
import hre, { ethers } from 'hardhat'

import { getChainId, isValidContract } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { SlowWallet } from '../../typechain'
import { getDeploymentFile, getDeploymentFilename } from './deployment_utils'

let slowWallet: SlowWallet

async function main() {
  // ==== Read Configuration ====
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  console.log(` Deploying SlowWallet to network ${hre.network.name} (${chainId})
    with burner account: ${burner.address}`)

  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  const deploymentFilename = getDeploymentFilename(chainId)
  const deployments = getDeploymentFile(deploymentFilename)

  if (!deployments.rsr) {
    throw new Error(`Missing address for RSR in network ${hre.network.name}`)
  } else if (!(await isValidContract(hre, deployments.rsr))) {
    throw new Error(`RSR contract not found in network ${hre.network.name}`)
  }

  // Get CompanySafe address
  const companySafeAddr = networkConfig[chainId].companySafe
  if (!companySafeAddr) {
    throw new Error(`Missing address for CompanySafe in network ${hre.network.name}`)
  }

  // ******************** Deploy SlowWallet ****************************************/

  const SlowWalletDeploy = await ethers.getContractFactory('SlowWallet')
  slowWallet = <SlowWallet>(
    await SlowWalletDeploy.connect(burner).deploy(deployments.rsr, companySafeAddr)
  )
  await slowWallet.deployed()

  // ********************* Output Further Configuration******************************
  deployments.slowWallet = slowWallet.address
  fs.writeFileSync(deploymentFilename, JSON.stringify(deployments, null, 2))

  console.log(`Deployed to ${hre.network.name} (${chainId}):
    SlowWallet: ${slowWallet.address}

    Deployment file: ${deploymentFilename}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
