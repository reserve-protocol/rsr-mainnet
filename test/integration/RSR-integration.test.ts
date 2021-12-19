import { JsonRpcSigner } from '@ethersproject/providers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import hre from 'hardhat'

import { MultiSigWalletWithDailyLimit } from '../../typechain/MultiSigWalletWithDailyLimit'
import { ReserveRightsToken } from '../../typechain/ReserveRightsToken'
import { RSR } from '../../typechain/RSR'
import { SlowWallet } from '../../typechain/SlowWallet'
import { impersonate } from './utils/accounts'

// Relevant addresses (Mainnet)
const RSR_PREVIOUS_ADDRESS = '0x8762db106b2c2a0bccb3a80d1ed41273552616e8'
const RSR_PAUSER_ADDRESS = '0xBb20467EcccB3F60F8dbEca09a61879893e44069'
const SLOW_WALLET = '0x4903DC97816f99410E8dfFF51149fA4C3CdaD1b8'
const MULTISIG_WALLET = '0xb268c230720D16C69a61CBeE24731E3b2a3330A1'
const HOLDER_ADDRESS = '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB'

describe('RSR contract - Mainnet Forking', function () {
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress
  let pauser: JsonRpcSigner
  let holder: JsonRpcSigner

  let prevRSR: ReserveRightsToken
  let slowWallet: SlowWallet
  let multisigWallet: MultiSigWalletWithDailyLimit
  let rsrToken: RSR

  beforeEach(async function () {
    ;[owner, addr1, addr2] = await ethers.getSigners()

    // Use Mainnet fork
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.MAINNET_RPC_URL,
            blockNumber: 13810440,
          },
        },
      ],
    })

    // Retrieve Deployed contracts
    prevRSR = <ReserveRightsToken>(
      await ethers.getContractAt('ReserveRightsToken', RSR_PREVIOUS_ADDRESS)
    )
    slowWallet = <SlowWallet>await ethers.getContractAt('SlowWallet', SLOW_WALLET)
    multisigWallet = <MultiSigWalletWithDailyLimit>(
      await ethers.getContractAt('MultiSigWalletWithDailyLimit', MULTISIG_WALLET)
    )

    // Impersonate accounts
    pauser = await impersonate(RSR_PAUSER_ADDRESS)
    holder = await impersonate(HOLDER_ADDRESS)

    // Deploy new RSR
    const RSR = await ethers.getContractFactory('RSR')
    rsrToken = <RSR>await RSR.connect(owner).deploy(prevRSR.address)
  })

  describe('Deployment', function () {
    it('Should start with the total supply of previous RSR', async function () {
      const totalSupplyPrev = await prevRSR.totalSupply()
      expect(await rsrToken.totalSupply()).to.equal(totalSupplyPrev)
    })
  })

  describe('Balances and Transfers - Before Pausing Previous RSR', function () {
    it('Should return balances from previous RSR if not crossed', async function () {
      // Compare balances between contracts
      expect(await rsrToken.balanceOf(HOLDER_ADDRESS)).to.equal(
        await prevRSR.balanceOf(HOLDER_ADDRESS)
      )
      expect(await rsrToken.balanceOf(addr1.address)).to.equal(
        await prevRSR.balanceOf(addr1.address)
      )

      // Ensure no tokens were crossed
      expect(await rsrToken.balCrossed(HOLDER_ADDRESS)).to.equal(false)
      expect(await rsrToken.balCrossed(addr1.address)).to.equal(false)
    })

    it('Should not allow to transfer tokens between accounts', async function () {
      // Transfer 50 tokens from holder to addr1
      const amount = BigNumber.from(50000)
      const holderBalancePrev = await rsrToken.balanceOf(HOLDER_ADDRESS)
      const addr1BalancePrev = await rsrToken.balanceOf(addr1.address)

      // Attempt to  transfer
      await expect(rsrToken.connect(holder).transfer(addr1.address, amount)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )

      // Balances remain unchanged
      expect(await rsrToken.balanceOf(addr1.address)).to.equal(addr1BalancePrev)
      expect(await rsrToken.balanceOf(HOLDER_ADDRESS)).to.equal(holderBalancePrev)

      // Check owner has not crossed
      expect(await rsrToken.balCrossed(HOLDER_ADDRESS)).to.equal(false)
      expect(await rsrToken.balCrossed(addr1.address)).to.equal(false)
    })
  })

  describe('Balances and Transfers - After Pausing Previous RSR', function () {
    let totalSupply: BigNumber

    beforeEach(async function () {
      // Impersonate Accounts
      pauser = await impersonate(RSR_PAUSER_ADDRESS)
      holder = await impersonate(HOLDER_ADDRESS)

      // Pause previous contract
      await prevRSR.connect(pauser).pause({})

      // Renounce ownership of new RSR
      await rsrToken.connect(owner).renounceOwnership()

      totalSupply = await rsrToken.totalSupply()
    })

    it('Should transfer tokens between accounts and cross sender', async function () {
      // Transfer 50 tokens from holder to addr1
      const amount = BigNumber.from(50000)
      const holderBalancePrev = await rsrToken.balanceOf(HOLDER_ADDRESS)
      const addr1BalancePrev = await rsrToken.balanceOf(addr1.address)

      // Perform transfer
      await rsrToken.connect(holder).transfer(addr1.address, amount)

      expect(await rsrToken.balanceOf(addr1.address)).to.equal(addr1BalancePrev.add(amount))
      expect(await rsrToken.balanceOf(HOLDER_ADDRESS)).to.equal(holderBalancePrev.sub(amount))

      // Check owner has crossed
      expect(await rsrToken.balCrossed(HOLDER_ADDRESS)).to.equal(true)
      expect(await rsrToken.balCrossed(addr1.address)).to.equal(false)
    })
  })
})
