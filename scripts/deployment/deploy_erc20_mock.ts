import hre, { ethers } from 'hardhat'

import { getChainId } from '../../common/blockchain-utils'
import { networkConfig } from '../../common/configuration'
import { ERC20Mock } from '../../typechain'

let erc20Mock: ERC20Mock

async function main() {
  // ==== Read Configuration ====
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)

  console.log(` Deploying old mock RSR to network ${hre.network.name} (${chainId})
    with burner account: ${burner.address}`)

  // ******************** Deploy RSR ****************************************/

  const ERC20MockFactory = await ethers.getContractFactory('ERC20Mock')
  erc20Mock = <ERC20Mock>await ERC20MockFactory.connect(burner).deploy('RToken test', 'RTOKTEST')
  await erc20Mock.deployed()

  console.log(`Deployed to ${hre.network.name} (${chainId}):
    ERC20Mock: ${erc20Mock.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
