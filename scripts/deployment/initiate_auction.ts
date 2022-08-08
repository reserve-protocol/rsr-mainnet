import hre, { ethers } from 'hardhat'

import { getChainId } from '../../common/blockchain-utils'
import { ERC20Mock, IEasyAuction, EasyAuctionCaller } from '../../typechain'

async function main() {
  // ==== Read Configuration ====
  const [burner] = await hre.ethers.getSigners()
  const chainId = await getChainId(hre)
  const rsrAddr = '0x7244FD4a26daCA27CeaA5EC46a1807EAbDAcC587'
  const easyAuctionAddr = '0xC5992c0e0A3267C7F75493D0F717201E26BE35f7'
  const wethAddr = '0xdf032bc4b9dc2782bb09352007d4c57b75160b15'
  // burner addr: 0x72BE71a89A7a8Df4C4585bBa454e3b0A8809C195

  console.log(` Initiating auction on network ${hre.network.name} (${chainId})
    with burner account: ${burner.address} using RSR: ${rsrAddr}`)

  // ******************** Mint RSR ****************************************/

  //   const CallerFactory = await ethers.getContractFactory('EasyAuctionCaller')
  //   const caller = <EasyAuctionCaller>await CallerFactory.connect(burner).deploy()
  //   await caller.deployed()

  const callerAddr = '0x69db94ace3c61da513e819d0c147fd3aae1a3282'
  const caller = <EasyAuctionCaller>await ethers.getContractAt('EasyAuctionCaller', callerAddr)

  console.log(` Deployed caller to: ${caller.address}`)

  //   const rsr = <ERC20Mock>await ethers.getContractAt('ERC20Mock', rsrAddr)
  //   await rsr.connect(burner).mint(caller.address, '1000000000000000000000000000')

  const call = await caller.connect(burner).initiateAuction(easyAuctionAddr, rsrAddr, wethAddr)
  console.log(call)
  await call.wait()
  console.log(call)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
