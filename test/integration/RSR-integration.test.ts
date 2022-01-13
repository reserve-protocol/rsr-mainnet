import { JsonRpcSigner } from '@ethersproject/providers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import hre, { ethers } from 'hardhat'

import { bn, ONE, ZERO } from '../../common/numbers'
import { ForkSpell } from '../../typechain/ForkSpell'
import { ReserveRightsToken } from '../../typechain/ReserveRightsToken'
import { RSR } from '../../typechain/RSR'
import { SiphonSpell } from '../../typechain/SiphonSpell'
import { WEIGHT_ONE, ZERO_ADDRESS } from '../common'
import { UPGRADE_SIPHONS } from './../../scripts/deployment/siphon_config'
import { impersonate } from './utils/accounts'

// Note: More siphon tests cases can be added when the contract is deployed
// For the mainnet fork, only test the first 5 addresses with balances using different weight values
const realSiphons = UPGRADE_SIPHONS

// Relevant addresses (Mainnet)
const RSR_PREVIOUS_ADDRESS = '0x8762db106b2c2a0bccb3a80d1ed41273552616e8'
const RSR_NEW_ADDRESS = '0x320623b8e4ff03373931769a31fc52a4e78b5d70'
const HOLDER_ADDRESS = '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB'
const SIPHON_SPELL_ADDRESS = '0x3eb1438b1edff7d899a863d4792e8d8f7d455277'
const COMPANY_SAFE_ADDRESS = '0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770'
const FORK_SPELL_ADDRESS = '0x53b968caf6a1715caa8fa3f0fb63e8d09a6433e1'
const SLOW_WALLET_ADDRESS = '0x6bab6EB87Aa5a1e4A8310C73bDAAA8A5dAAd81C1'

// Accounts
let addr1: SignerWithAddress
let companySafe: JsonRpcSigner
let holder: JsonRpcSigner
// Contracts
let oldRSR: ReserveRightsToken
let rsr: RSR
let forkSpell: ForkSpell
let siphonSpell: SiphonSpell

// RSR Phases (lifecycle)
const Phase = {
  SETUP: 0,
  WORKING: 1,
}

// Setup test environment
const setup = async () => {
  ;[addr1] = await ethers.getSigners()

  // Use Mainnet fork
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.MAINNET_RPC_URL,
          blockNumber: 13998722,
        },
      },
    ],
  })

  await hre.network.provider.send('hardhat_setBalance', [
    COMPANY_SAFE_ADDRESS,
    '0x100000000000000000000000',
  ])

  // Retrieve Deployed contracts
  oldRSR = <ReserveRightsToken>(
    await ethers.getContractAt('ReserveRightsToken', RSR_PREVIOUS_ADDRESS)
  )

  // Impersonate accounts
  companySafe = await impersonate(COMPANY_SAFE_ADDRESS)
  holder = await impersonate(HOLDER_ADDRESS)
}

// Deploy new RSR contract
const setRSR = async () => {
  rsr = <RSR>await ethers.getContractAt('RSR', RSR_NEW_ADDRESS)
}

// Deploy fork spell for RSR
const setForkSpell = async () => {
  forkSpell = <ForkSpell>await ethers.getContractAt('ForkSpell', FORK_SPELL_ADDRESS)
}

// Deploy siphon contract
const setSiphonSpell = async () => {
  // const SiphonSpellfactory = await ethers.getContractFactory('SiphonSpell')
  // siphonSpell = <SiphonSpell>await SiphonSpellfactory.connect(burner2).deploy(rsr.address, siphons)
  siphonSpell = <SiphonSpell>await ethers.getContractAt('SiphonSpell', SIPHON_SPELL_ADDRESS)
}

describe('RSR contract - Mainnet Forking', function () {
  before(async () => {
    await setup()
  })

  // *************** Phase 1 *******************
  describe('Prior to pausing OldRSR (Deployment Phase 1)', async () => {
    before(async () => {
      await setRSR()
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
      expect(await rsr.owner()).to.eq(companySafe._address)
      expect(await rsr.pauser()).to.eq(companySafe._address)
    })

    it('RSR should not be able to be unpaused during the [SETUP] phase', async () => {
      await expect(rsr.connect(companySafe).unpause()).to.be.revertedWith(
        'only during working phase'
      )
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
    describe('Then pausing OldRSR (Deployment Phase 2)', async () => {
      before(async () => {
        await setForkSpell()
      })

      it('the deployed fork spell should point to the expected RSR address', async () => {
        expect((await forkSpell.rsrAddr()).toLowerCase()).to.eq(rsr.address)
      })

      it('the fork spell should be a Pauser of OldRSR', async () => {
        expect(await oldRSR.isPauser(forkSpell.address))
        expect(await oldRSR.isPauser(companySafe._address))
      })

      it('OldRSR should not be paused', async () => {
        expect(await oldRSR.paused()).to.eq(false)
      })

      // *************** Phase 3 *******************
      describe('Then deploying and casting the SiphonSpell (Deployment Phase 3)', async () => {
        before(async () => {
          // deploy + cast siphonspell
          await setSiphonSpell()
          await rsr.connect(companySafe).castSpell(siphonSpell.address)
        })

        it.only('the siphon spell should have been executed', async () => {
          expect(await siphonSpell.hasBeenCast()).to.eq(true)
        })

        it('the siphon spell should not be able to be executed twice', async () => {
          await expect(rsr.connect(companySafe).castSpell(siphonSpell.address)).to.be.revertedWith(
            'spell already cast'
          )
        })

        it('rsr weights should be configured', async () => {
          for (const siphon of realSiphons) {
            expect(await rsr.hasWeights(siphon.from)).to.eq(true)
            expect(await rsr.weights(siphon.from, siphon.to)).to.eq(siphon.weight)
          }
        })

        // it('a newly deployed siphon spell can be called to change weights', async () => {
        //   // This siphon send all the balance from the first mockSiphon address to a hardhat mock address
        //   // await setSiphonSpell([
        //   //   { from: realSiphons[0].from, to: addr1.address, weight: WEIGHT_ONE },
        //   // ])

        //   await expect(rsr.connect(companySafe).castSpell(siphonSpell.address))
        //     .to.emit(rsr, 'MageChanged')
        //     .withArgs(ZERO_ADDRESS, siphonSpell.address)
        //     .and.to.emit(rsr, 'MageChanged')
        //     .withArgs(siphonSpell.address, ZERO_ADDRESS)
        //     .and.to.emit(rsr, 'SpellCast')
        //     .withArgs(siphonSpell.address)
        // })

        // it('balance of newly affected addresses by the siphon should be updated', async () => {
        //   expect(await rsr.weights(realSiphons[0].from, addr1.address)).to.eq(WEIGHT_ONE)
        //   // Balance of the first address of the first siphons
        //   expect(await rsr.balanceOf(addr1.address)).to.eq(
        //     await oldRSR.balanceOf(realSiphons[0].from)
        //   )
        // })

        it('rsr balances of addresses with weights should not be crossed', async () => {
          for (const siphon of realSiphons) {
            expect(await rsr.balCrossed(siphon.from)).to.eq(false)
          }
        })

        it('rsr balance is what is expected for slow wallet', async () => {
          const slowBal = bn('49448001323102000000000000000')
          expect(await rsr.balanceOf(SLOW_WALLET_ADDRESS)).to.eq(slowBal)
        })

        // *************** Phase 4 *******************
        describe('Then moving to the WORKING phase (The Fork, Deployment Phase 4)', async () => {
          before(async () => {
            await rsr.connect(companySafe).castSpell(forkSpell.address)
          })
          it('should only fork once', async () => {
            // Already deployed spell
            await expect(rsr.connect(companySafe).castSpell(forkSpell.address)).to.be.reverted
            // Newly deployed spell
            await setForkSpell()
            await expect(rsr.connect(companySafe).castSpell(forkSpell.address)).to.be.reverted
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
            expect(await rsr.pauser()).to.eq(companySafe._address)
          })
          it('rsr.pauser should be able to be renounced', async () => {
            await expect(rsr.connect(companySafe).renouncePauser())
              .to.emit(rsr, 'PauserChanged')
              .withArgs(companySafe._address, ZERO_ADDRESS)
            expect(await rsr.pauser()).to.equal(ZERO_ADDRESS)
            await expect(rsr.connect(companySafe).pause()).to.be.revertedWith(
              'only pauser, mage, or owner'
            )
          })
          it('dont allow siphon from the [WORKING] phase', async () => {
            await expect(
              rsr.connect(companySafe).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
            ).to.be.revertedWith('owner')
          })
          // it('balances should be updated according to previously spelled siphons', async () => {
          //   for (const siphon of realSiphons.slice(1)) {
          //     const currentBal = await rsr.balanceOf(siphon.from)
          //     const oldBal = await oldRSR.balanceOf(siphon.from)

          //     // weight 0, balance unchanged
          //     if (siphon.weight.eq(bn(0))) {
          //       expect(currentBal).to.eq(oldBal)
          //     } else {
          //       expect(currentBal).to.not.eq(oldBal)

          //       // if the siphon weight is one, new balance should be 0
          //       if (siphon.weight === WEIGHT_ONE) {
          //         expect(currentBal).to.eq(ZERO)
          //       } else {
          //         const substracted = oldBal.mul(siphon.weight).div(WEIGHT_ONE)
          //         // If the weight is a fraction, the new balance should match that fraction calculation
          //         expect(currentBal).to.eq(oldBal.sub(substracted))
          //       }
          //     }
          //   }
          //   // Second runned siphon
          //   expect(await rsr.balanceOf(realSiphons[0].from)).to.eq(bn(0))
          //   expect(await rsr.balanceOf(addr1.address)).to.eq(
          //     await oldRSR.balanceOf(realSiphons[0].from)
          //   )
          // })
          it('account with no weight have their balance unchanged', async () => {
            expect(await oldRSR.balanceOf(holder._address)).to.eq(
              await rsr.balanceOf(holder._address)
            )
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
