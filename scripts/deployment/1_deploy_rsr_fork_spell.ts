import fs from 'fs'
import hre, { ethers } from 'hardhat'

import { getChainId, isValidContract } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { ForkSpell, RSR } from '../../typechain'
import { fileExists, getDeploymentFilename, IDeployments } from './deployment_utils'

let rsrToken: RSR
let forkSpell: ForkSpell

async function main() {
  // ==== Read Configuration ====
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  console.log(` Deploying RSR and ForkSpell to network ${hre.network.name} (${chainId})
    with burner account: ${burner.address}`)

  if (!networkConfig[chainId]) {
    throw new Error(`Missing network configuration for ${hre.network.name}`)
  }

  // Check if deployment file already exists for this chainId
  const deploymentFilename = getDeploymentFilename(chainId)
  if (fileExists(deploymentFilename)) {
    throw new Error(`${deploymentFilename} exists; I won't overwrite it.`)
  }

  // Get oldRSR Address
  const oldRSRAddr = networkConfig[chainId].oldRSR
  if (!oldRSRAddr) {
    throw new Error(`Missing address for previous RSR in network ${hre.network.name}`)
  } else if (!(await isValidContract(hre, oldRSRAddr))) {
    throw new Error(`Previous RSR contract not found in network ${hre.network.name}`)
  }

  // Get CompanySafe address
  const companySafeAddr = networkConfig[chainId].companySafe
  if (!companySafeAddr) {
    throw new Error(`Missing address for CompanySafe in network ${hre.network.name}`)
  }

  // ******************** Deploy RSR ****************************************/

  const RSR = await ethers.getContractFactory('RSR')
  rsrToken = <RSR>await RSR.connect(burner).deploy(oldRSRAddr)
  await rsrToken.deployed()

  // ********************* Transfer Auth **** **************************************/
  await rsrToken.connect(burner).changePauser(companySafeAddr)
  await rsrToken.connect(burner).transferOwnership(companySafeAddr)

  // ******************** Deploy Fork Spell ****************************************/
  const ForkSpellFactory = await ethers.getContractFactory('ForkSpell')
  forkSpell = <ForkSpell>await ForkSpellFactory.deploy(oldRSRAddr, rsrToken.address)
  await forkSpell.deployed()

  // ********************* Output Further Configuration******************************
  const deployments: IDeployments = {
    oldRSR: oldRSRAddr,
    rsr: rsrToken.address,
    forkSpell: forkSpell.address,
    siphonSpell: '',
  }
  fs.writeFileSync(deploymentFilename, JSON.stringify(deployments, null, 2))

  console.log(`Deployed to ${hre.network.name} (${chainId}):
    RSR:       ${rsrToken.address}
    RSR.owner: ${companySafeAddr}
    ForkSpell: ${forkSpell.address}

    Deployment file: ${deploymentFilename}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
