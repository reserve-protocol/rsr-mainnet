import hre, { ethers } from 'hardhat'

import { getChainId } from '../../common/blockchain-utils'

async function main() {
  // ==== Read Configuration ====
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)
  const rsrAddr = '0x7244FD4a26daCA27CeaA5EC46a1807EAbDAcC587'

  console.log(` Initiating auction on network ${hre.network.name} (${chainId})
    with burner account: ${burner.address} using RSR: ${rsrAddr}`)

  // ******************** Deploy RSR ****************************************/
  console.time('Verifying RSR')
  await hre.run('verify:verify', {
    address: rsrAddr,
    constructorArguments: ['RToken test', 'RTOKTEST'],
    contract: 'contracts/test/ERC20Mock.sol:ERC20Mock',
  })
  console.timeEnd('Verifying RSR')

  console.log(`Verified on ${hre.network.name} (${chainId}):
    for ERC20Mock: ${rsrAddr}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
