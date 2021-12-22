import { JsonRpcSigner } from '@ethersproject/providers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import hre, { ethers } from 'hardhat'

import { ForkSpell } from '../../typechain/ForkSpell'
import { MultiSigWalletWithDailyLimit } from '../../typechain/MultiSigWalletWithDailyLimit'
import { ReserveRightsToken } from '../../typechain/ReserveRightsToken'
import { RSR } from '../../typechain/RSR'
import { SiphonSpell } from '../../typechain/SiphonSpell'
import { SlowWallet } from '../../typechain/SlowWallet'
import { UPGRADE_SIPHONS } from './../../scripts/deployment/siphon_config'
import { impersonate } from './utils/accounts'
import { ONE, ZERO } from '../../common/numbers'
import { WEIGHT_ONE, ZERO_ADDRESS } from '../common'

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
// eslint-disable-next-line no-unused-vars
let slowWallet: SlowWallet
// eslint-disable-next-line no-unused-vars
let multisigWallet: MultiSigWalletWithDailyLimit
let rsr: RSR
let forkSpell: ForkSpell
let siphonSpell: SiphonSpell

const Phase = {
  SETUP: 0,
  WORKING: 1,
}

// Setup test environment
const setup = async () => {
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
}

// Deploy new RSR contract
const deployRSR = async () => {
  const RSR = await ethers.getContractFactory('RSR')
  rsr = <RSR>await RSR.connect(burner0).deploy(oldRSR.address)

  await rsr.connect(burner0).changePauser(companySafe.address)
  await rsr.connect(burner0).transferOwnership(companySafe.address)
}

// Deploy fork spell for RSR
const deployForkSpell = async () => {
  const ForkSpellFactory = await ethers.getContractFactory('ForkSpell')
  forkSpell = <ForkSpell>await ForkSpellFactory.connect(burner1).deploy(oldRSR.address, rsr.address)
}

// Deploy siphon contract
const deploySiphon = async (siphons = UPGRADE_SIPHONS) => {
  const SiphonSpellfactory = await ethers.getContractFactory('SiphonSpell')
  siphonSpell = <SiphonSpell>(
    await SiphonSpellfactory.connect(burner2).deploy(rsr.address, UPGRADE_SIPHONS)
  )
}

describe('RSR contract - Mainnet Forking', function () {
  before(async () => {
    await setup()
  })

  // *************** Phase 1 *******************
  describe('Prior to pausing OldRSR (Deployment Phase 1)', async () => {
    before(async () => {
      await deployRSR()
    })

    it('should start with the total supply of OldRSR', async function () {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.eq(totalSupplyPrev)
    })

    it('should start paused and in the [SETUP] phase', async () => {
      expect(await rsr.paused()).to.eq(true)
      expect(await rsr.phase()).to.eq(Phase.SETUP)
    })

    it('RSR owner and pauser should be the companySafe address', async () => {
      expect(await rsr.owner()).to.eq(companySafe.address)
      expect(await rsr.pauser()).to.eq(companySafe.address)
    })

    it('RSR and OldRSR balanceOf should be equal', async () => {
      expect(await rsr.balanceOf(holder._address)).to.eq(await oldRSR.balanceOf(holder._address))
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

    // *************** Phase 2 *******************
    describe('Then pausing OldRSR (Deployment Phase 2)', () => {
      before(async () => {
        await deployForkSpell()
        await oldRSR.connect(pauser).addPauser(forkSpell.address)
      })

      it('the deployed fork spell should point to the expected RSR address', async () => {
        expect(await forkSpell.rsrAddr()).to.eq(rsr.address)
      })

      it('the fork spell should be a Pauser of OldRSR', async () => {
        expect(await oldRSR.isPauser(forkSpell.address))
      })

      it('OldRSR should not be paused', async () => {
        expect(await oldRSR.paused()).to.eq(false)
      })

      // *************** Phase 3 *******************
      describe('Then deploying and casting the SiphonSpell (Deployment Phase 3)', async () => {
        before(async () => {
          // deploy + cast siphonspell
          await deploySiphon()
          await rsr.connect(companySafe).castSpell(siphonSpell.address)
        })

        it.skip('rsr weights should be configured', async () => {
          // check weights as in deployment plan
        })

        // *************** Phase 4 *******************
        describe('Then moving to the WORKING phase (The Fork, Deployment Phase 4)', async () => {
          before(async () => {
            await rsr.connect(companySafe).castSpell(forkSpell.address)
          })
          it('OldRSR should be paused', async () => {
            expect(await oldRSR.paused()).to.eq(true)
          })
          it('rsr should be in [WORKING] phase', async () => {
            expect(await rsr.phase()).to.eq(Phase.WORKING)
          })
          it('rsr.owner and rsr.mage should be zero', async () => {
            expect(await rsr.owner()).to.eq(ZERO_ADDRESS)
            expect(await rsr.mage()).to.eq(ZERO_ADDRESS)
          })
          it('rsr.pauser should be CompanySafe', async () => {
            expect(await rsr.pauser()).to.eq(companySafe.address)
          })
          it('dont allow siphon from the [WORKING] phase', async () => {
            await expect(
              rsr.connect(companySafe).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
            ).to.be.revertedWith('owner')
          })
          it('balances should be crossed when doing a transfer', async () => {
            expect(await rsr.balCrossed(holder._address)).to.eq(false)
            await rsr.connect(holder).transfer(holder._address, ZERO)
            expect(await rsr.balCrossed(holder._address)).to.eq(true)
          })
        })
      })
    })
  })
})
