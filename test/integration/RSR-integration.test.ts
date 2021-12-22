import { JsonRpcSigner } from '@ethersproject/providers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import hre, { ethers } from 'hardhat'

import { ForkSpell } from '../../typechain/ForkSpell'
import { MultiSigWalletWithDailyLimit } from '../../typechain/MultiSigWalletWithDailyLimit'
import { ReserveRightsToken } from '../../typechain/ReserveRightsToken'
import { RSR } from '../../typechain/RSR'
import { SiphonSpell } from '../../typechain/SiphonSpell'
import { SlowWallet } from '../../typechain/SlowWallet'
import { UPGRADE_SIPHONS } from './../../scripts/deployment/siphon_config'
import { impersonate } from './utils/accounts'
import { bn, ONE, ZERO } from '../../common/numbers'
import { Siphon, WEIGHT_ONE, ZERO_ADDRESS } from '../common'

// Relevant addresses (Mainnet)
const RSR_PREVIOUS_ADDRESS = '0x8762db106b2c2a0bccb3a80d1ed41273552616e8'
const RSR_PAUSER_ADDRESS = '0xBb20467EcccB3F60F8dbEca09a61879893e44069'
const SLOW_WALLET = '0x4903DC97816f99410E8dfFF51149fA4C3CdaD1b8'
const MULTISIG_WALLET = '0xb268c230720D16C69a61CBeE24731E3b2a3330A1'
const HOLDER_ADDRESS = '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB'

// let owner: SignerWithAddress
let addr1: SignerWithAddress
let burner0: SignerWithAddress
let burner1: SignerWithAddress
let burner2: SignerWithAddress
let companySafe: SignerWithAddress
let pauser: JsonRpcSigner
let holder: JsonRpcSigner

let oldRSR: ReserveRightsToken
let slowWallet: SlowWallet
let multisigWallet: MultiSigWalletWithDailyLimit
let rsr: RSR
let forkSpell: ForkSpell
let siphonSpell: SiphonSpell

enum Phase {
  SETUP,
  WORKING,
}

// Deploy RSR-related contracts -- Phase 1 of deployment plan
const deployContracts = async () => {
  ;[addr1, burner0, burner1, burner2, companySafe] = await ethers.getSigners()

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
  oldRSR = <ReserveRightsToken>(
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
  rsr = <RSR>await RSR.connect(burner0).deploy(oldRSR.address)
  await rsr.connect(burner0).changePauser(companySafe.address)
  await rsr.connect(burner0).transferOwnership(companySafe.address)

  // Deploy fork spell
  const ForkSpellFactory = await ethers.getContractFactory('ForkSpell')
  forkSpell = <ForkSpell>await ForkSpellFactory.deploy(oldRSR.address, rsr.address)
}

// @comment: contract deployment required before deploying siphons -- Phase 3 of deployment plan
const deploySiphon = async (siphons = UPGRADE_SIPHONS) => {
  const SiphonSpellfactory = await ethers.getContractFactory('SiphonSpell')
  siphonSpell = <SiphonSpell>await SiphonSpellfactory.deploy(rsr.address, UPGRADE_SIPHONS)
}

describe('RSR contract - Mainnet Forking', function () {
  before(async () => {
    await deployContracts()
  })

  describe('Prior to pausing OldRSR (Deployment Phase 1)', async () => {
    it('Should start with the total supply of previous RSR', async function () {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
    })

    it('dont allow RSR move to WORKING phase if OldRSR is not paused', async () => {
      await expect(rsr.connect(companySafe).moveToWorking()).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
    })

    it('cannot change weight if the account is not the owner', async () => {
      await expect(
        rsr.connect(addr1).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only mage or owner')
    })

    it('should not allow RSR transfers or approvals during [SETUP] phase', async () => {
      await expect(rsr.connect(companySafe).transfer(addr1.address, ONE)).to.be.reverted
      await expect(rsr.connect(companySafe).approve(addr1.address, ONE)).to.be.reverted
    })

    describe('Then pausing oldRSR (Deployment Phase 2)', () => {
      before(async () => {
        await oldRSR.connect(pauser).addPauser(forkSpell.address)
        await rsr.connect(companySafe).castSpell(forkSpell.address)
      })
      it('rsr should be in WORKING', async () => {
        expect(await rsr.phase()).to.eq(Phase.WORKING)
      })

      describe('Then deploying and casting the SiphonSpell (Deployment Phase 3)', async () => {
        before(async () => {})

        describe('Then moving to the WORKING phase (Deployment Phase 4)', async () => {
          before(async () => {
            await rsr.connect(companySafe).moveToWorking()
          })
          it('rsr should be in WORKING', async () => {
            expect(await rsr.phase()).to.eq(Phase.WORKING)
          })
          it('rsr.owner should be zero', async () => {
            expect(await rsr.owner()).to.eq(ZERO_ADDRESS)
          })
          it('dont allow siphon from the WORKING phase', async () => {
            await expect(
              rsr.connect(companySafe).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
            ).to.be.revertedWith('owner')
          })
        })
      })
    })
  })

  describe('After the upgrade (WORKING phase)', () => {
    beforeEach(async () => {
      await deploySiphon()
    })
  })

  // describe.skip('Balances and Transfers - Before Pausing Previous RSR', function () {
  //   it('Should return balances from previous RSR if not crossed', async function () {
  //     // Compare balances between contracts
  //     expect(await rsr.balanceOf(HOLDER_ADDRESS)).to.equal(await oldRSR.balanceOf(HOLDER_ADDRESS))
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(await oldRSR.balanceOf(addr1.address))

  //     // Ensure no tokens were crossed
  //     expect(await rsr.balCrossed(HOLDER_ADDRESS)).to.equal(false)
  //     expect(await rsr.balCrossed(addr1.address)).to.equal(false)
  //   })

  //   it('Should not allow to transfer tokens between accounts', async function () {
  //     // Transfer 50 tokens from holder to addr1
  //     const amount = BigNumber.from(50000)
  //     const holderBalancePrev = await rsr.balanceOf(HOLDER_ADDRESS)
  //     const addr1BalancePrev = await rsr.balanceOf(addr1.address)

  //     // Attempt to  transfer
  //     await expect(rsr.connect(holder).transfer(addr1.address, amount)).to.be.revertedWith(
  //       'Pausable: paused'
  //     )

  //     // Balances remain unchanged
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev)
  //     expect(await rsr.balanceOf(HOLDER_ADDRESS)).to.equal(holderBalancePrev)

  //     // Check companySafe has not crossed
  //     expect(await rsr.balCrossed(HOLDER_ADDRESS)).to.equal(false)
  //     expect(await rsr.balCrossed(addr1.address)).to.equal(false)
  //   })
  // })

  // describe.skip('Balances and Transfers - After Pausing Previous RSR', function () {
  //   beforeEach(async function () {
  //     // Impersonate Accounts
  //     pauser = await impersonate(RSR_PAUSER_ADDRESS)
  //     holder = await impersonate(HOLDER_ADDRESS)

  //     // Pause previous contract
  //     await oldRSR.connect(pauser).pause()

  //     // Renounce ownership of new RSR
  //     await rsr.connect(companySafe).renounceOwnership()
  //     await rsr.connect(companySafe).unpause()
  //   })

  //   it('Should transfer tokens between accounts and cross sender', async function () {
  //     // Transfer 50 tokens from holder to addr1
  //     const amount = BigNumber.from(50000)
  //     const holderBalancePrev = await rsr.balanceOf(HOLDER_ADDRESS)
  //     const addr1BalancePrev = await rsr.balanceOf(addr1.address)

  //     // Perform transfer
  //     await rsr.connect(holder).transfer(addr1.address, amount)

  //     expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev.add(amount))
  //     expect(await rsr.balanceOf(HOLDER_ADDRESS)).to.equal(holderBalancePrev.sub(amount))

  //     // Check that balances have crossed
  //     expect(await rsr.balCrossed(HOLDER_ADDRESS)).to.equal(true)
  //     expect(await rsr.balCrossed(addr1.address)).to.equal(false)
  //   })
  // })
})
