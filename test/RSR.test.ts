import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { signERC2612Permit } from 'eth-permit'
import { ContractFactory } from 'ethers'
import { ethers } from 'hardhat'
import { ONE, ZERO } from '../common/numbers'
import { ERC20Mock, ForkSpell, ReserveRightsTokenMock, RSRMock, SiphonSpell } from '../typechain'
import { Siphon, WEIGHT_ONE, ZERO_ADDRESS } from './common'

let owner: SignerWithAddress
let addr1: SignerWithAddress
let addr2: SignerWithAddress
let addr3: SignerWithAddress
let oldRSR: ReserveRightsTokenMock
let SiphonSpellFactory: ContractFactory
let ForkSpellFactory: ContractFactory
let forkSpell: ForkSpell
let rsr: RSRMock

async function setInitialBalances() {
  await oldRSR.mint(owner.address, ONE)
  await oldRSR.mint(addr1.address, ONE.mul(2))
  await oldRSR.mint(addr2.address, ONE.mul(3))
  await oldRSR.connect(owner).approve(addr3.address, ONE)
  await oldRSR.connect(owner).approve(addr2.address, ONE)
}

async function castSiphons(...siphons: Siphon[]) {
  const siphonSpell = <SiphonSpell>(
    await SiphonSpellFactory.connect(owner).deploy(rsr.address, siphons)
  )
  await expect(rsr.connect(owner).castSpell(siphonSpell.address))
    .to.emit(rsr, 'MageChanged')
    .withArgs(ZERO_ADDRESS, siphonSpell.address)
    .and.to.emit(rsr, 'MageChanged')
    .withArgs(siphonSpell.address, ZERO_ADDRESS)
    .and.to.emit(rsr, 'SpellCast')
    .withArgs(siphonSpell.address)
}

describe('RSR contract', () => {
  beforeEach(async function () {
    ;[owner, addr1, addr2, addr3] = await ethers.getSigners()

    // Deploy ERC20Mock to stand-in for oldOldRSR
    const OldOldRSR = await ethers.getContractFactory('ERC20Mock')
    const oldOldRSR = <ERC20Mock>await OldOldRSR.deploy('Reserve Rights', 'RSR')
    // Deploy Previous RSR (Pausable)
    const OldRSR = await ethers.getContractFactory('ReserveRightsTokenMock')
    oldRSR = <ReserveRightsTokenMock>await OldRSR.deploy(oldOldRSR.address)
    // Deploy new RSR
    const RSR = await ethers.getContractFactory('RSRMock')
    rsr = <RSRMock>await RSR.connect(owner).deploy(oldRSR.address)
    // Spells
    SiphonSpellFactory = await ethers.getContractFactory('SiphonSpell')
    ForkSpellFactory = await ethers.getContractFactory('ForkSpell')
    forkSpell = <ForkSpell>await ForkSpellFactory.deploy(oldRSR.address, rsr.address)
    oldRSR.connect(owner).addPauser(forkSpell.address)
  })

  describe('Prior to the fork [SETUP] phase', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('should inherit the total supply for the old RSR', async () => {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
    })

    it('dont allow siphon from the [WORKING] phase', async () => {
      await oldRSR.connect(owner).pause()
      await expect(rsr.connect(owner).moveToWorking())
        .to.emit(rsr, 'Unpaused')
        .withArgs(owner.address)
        .and.to.emit(rsr, 'OwnershipTransferred')
        .withArgs(owner.address, ZERO_ADDRESS)

      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only mage or owner')
    })

    it('dont allow RSR move to [WORKING] phase if OldRSR is not paused', async () => {
      await expect(rsr.connect(owner).moveToWorking()).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
    })

    it('dont allow siphon if from is the zero address', async () => {
      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('from cannot be zero address')
    })

    it('cannot change weight if the account is not the owner', async () => {
      await expect(
        rsr.connect(addr1).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only mage or owner')
    })

    it('should not allow RSR transfers or approvals during the [SETUP] phase', async () => {
      const permit = await signERC2612Permit(
        ethers.provider,
        rsr.address,
        owner.address,
        addr1.address,
        '0'
      )

      await expect(rsr.connect(owner).transfer(addr1.address, 0)).to.be.revertedWith(
        'Pausable: paused'
      )
      await expect(
        rsr.connect(owner).transferFrom(owner.address, addr1.address, 0)
      ).to.be.revertedWith('Pausable: paused')
      await expect(rsr.connect(owner).approve(addr1.address, 0)).to.be.revertedWith(
        'Pausable: paused'
      )
      await expect(
        rsr
          .connect(owner)
          .permit(owner.address, addr1.address, '0', permit.deadline, permit.v, permit.r, permit.s)
      ).to.be.revertedWith('Pausable: paused')
      await expect(rsr.connect(owner).increaseAllowance(addr1.address, 0)).to.be.revertedWith(
        'Pausable: paused'
      )
      await expect(rsr.connect(owner).decreaseAllowance(addr1.address, 0)).to.be.revertedWith(
        'Pausable: paused'
      )
    })

    it('should cast siphon without change', async () => {
      await castSiphons({ from: addr1.address, to: addr1.address, weight: 0 })
      expect(await rsr.mage()).to.equal(ZERO_ADDRESS)
      expect(await rsr.owner()).to.equal(owner.address)
    })

    it('should not allow casting a siphon if its not from the RSR contract', async () => {
      const siphonSpell = <SiphonSpell>(
        await SiphonSpellFactory.connect(owner).deploy(rsr.address, [])
      )

      await expect(siphonSpell.connect(owner).cast()).to.be.revertedWith('rsr only')
    })

    it('should not be able to cast the siphon spell more than once', async () => {
      const siphonSpell = <SiphonSpell>await SiphonSpellFactory.connect(owner).deploy(rsr.address, [
        {
          from: addr1.address,
          to: addr1.address,
          weight: 0,
        },
      ])

      await expect(rsr.connect(owner).castSpell(siphonSpell.address))
        .to.emit(rsr, 'MageChanged')
        .withArgs(ZERO_ADDRESS, siphonSpell.address)
        .and.to.emit(rsr, 'MageChanged')
        .withArgs(siphonSpell.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'SpellCast')
        .withArgs(siphonSpell.address)

      await expect(rsr.connect(owner).castSpell(siphonSpell.address)).to.be.revertedWith(
        'spell already cast'
      )
    })

    it('should cast siphon with change', async () => {
      await castSiphons({ from: addr1.address, to: addr1.address, weight: WEIGHT_ONE })
      expect(await rsr.balCrossed(addr1.address)).to.equal(false)
      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE)
      expect(await rsr.hasWeights(addr1.address)).to.equal(true)
    })

    it('should distribute the weights correctly for the given account', async () => {
      expect(await rsr.hasWeights(addr1.address)).to.equal(false)
      expect(await rsr.hasWeights(addr2.address)).to.equal(false)
      expect(await rsr.hasWeights(addr3.address)).to.equal(false)
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })

      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE.div(2))
      expect(await rsr.weights(addr1.address, addr2.address)).to.equal(WEIGHT_ONE.div(2))

      await castSiphons({ from: addr1.address, to: addr3.address, weight: WEIGHT_ONE.div(4) })

      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE.div(4))
      expect(await rsr.weights(addr1.address, addr3.address)).to.equal(WEIGHT_ONE.div(4))
      expect(await rsr.weights(addr1.address, addr2.address)).to.equal(WEIGHT_ONE.div(2))
      expect(await rsr.hasWeights(addr1.address)).to.equal(true)
      // Only move sender weight not recipient
      expect(await rsr.hasWeights(addr2.address)).to.equal(false)
      expect(await rsr.hasWeights(addr3.address)).to.equal(false)
    })

    it('should not distribute more weight than the current account has', async () => {
      await rsr
        .connect(owner)
        .siphon(addr1.address, addr1.address, addr2.address, WEIGHT_ONE.div(2))
      await expect(
        rsr.connect(owner).siphon(addr1.address, addr1.address, addr2.address, WEIGHT_ONE)
      ).to.be.revertedWith('weight too big')
    })

    it('should revert when trying to unpause during the working phase', async () => {
      await expect(rsr.connect(owner).unpause()).to.be.revertedWith('only during working phase')
      await oldRSR.connect(owner).pause()
      await expect(rsr.connect(owner).moveToWorking())
        .to.emit(rsr, 'Unpaused')
        .withArgs(owner.address)
        .and.to.emit(rsr, 'OwnershipTransferred')
        .withArgs(owner.address, ZERO_ADDRESS)

      await expect(rsr.connect(owner).unpause()).to.be.revertedWith('Pausable: not paused')
    })

    it('should not allow pausing if the owner is not admin or pauser', async () => {
      await expect(rsr.connect(addr1).pause()).to.be.revertedWith('only pauser, mage, or owner')
    })
  })

  describe('The Upgrade', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('does the fork', async () => {
      await expect(rsr.connect(owner).castSpell(forkSpell.address))
        .to.emit(rsr, 'MageChanged')
        .withArgs(ZERO_ADDRESS, forkSpell.address)
        .and.to.emit(oldRSR, 'Paused')
        .withArgs(forkSpell.address)
        .and.to.emit(rsr, 'Unpaused')
        .withArgs(forkSpell.address)
        .and.to.emit(rsr, 'OwnershipTransferred')
        .withArgs(owner.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'MageChanged')
        .withArgs(forkSpell.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'SpellCast')
        .withArgs(forkSpell.address)
    })

    it('reverts if not pauser of oldRSR', async () => {
      const newForkSpell = <ForkSpell>await ForkSpellFactory.deploy(oldRSR.address, rsr.address)
      await expect(rsr.connect(owner).castSpell(newForkSpell.address)).to.be.reverted
    })

    it('The transition is only complete if RSR dont have an owner', async () => {
      await oldRSR.connect(owner).pause()
      await expect(rsr.connect(owner).transfer(addr1.address, ONE)).to.be.reverted
    })

    it('should only fork once', async () => {
      await expect(rsr.connect(owner).castSpell(forkSpell.address))
        .to.emit(rsr, 'MageChanged')
        .withArgs(ZERO_ADDRESS, forkSpell.address)
        .and.to.emit(oldRSR, 'Paused')
        .withArgs(forkSpell.address)
        .and.to.emit(rsr, 'Unpaused')
        .withArgs(forkSpell.address)
        .and.to.emit(rsr, 'OwnershipTransferred')
        .withArgs(owner.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'MageChanged')
        .withArgs(forkSpell.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'SpellCast')
        .withArgs(forkSpell.address)

      await expect(rsr.connect(owner).castSpell(forkSpell.address)).to.be.reverted

      const newForkSpell = <ForkSpell>await ForkSpellFactory.deploy(oldRSR.address, rsr.address)
      await oldRSR.addPauser(newForkSpell.address)
      await expect(rsr.connect(owner).castSpell(newForkSpell.address)).to.be.reverted
    })

    it('should calculate balances correctly after siphon', async () => {
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })
      await castSiphons({ from: addr2.address, to: addr3.address, weight: WEIGHT_ONE })
      await expect(rsr.connect(owner).castSpell(forkSpell.address))
        .to.emit(rsr, 'MageChanged')
        .withArgs(ZERO_ADDRESS, forkSpell.address)
        .and.to.emit(oldRSR, 'Paused')
        .withArgs(forkSpell.address)
        .and.to.emit(rsr, 'Unpaused')
        .withArgs(forkSpell.address)
        .and.to.emit(rsr, 'OwnershipTransferred')
        .withArgs(owner.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'MageChanged')
        .withArgs(forkSpell.address, ZERO_ADDRESS)
        .and.to.emit(rsr, 'SpellCast')
        .withArgs(forkSpell.address)

      expect(await rsr.balanceOf(addr1.address)).to.eq(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.eq(ONE)
      expect(await rsr.balanceOf(addr3.address)).to.eq(ONE.mul(3))
    })

    it('should not allow siphons to be done in the WORKING phase', async () => {
      await rsr.connect(owner).changePhase(1)
      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only during setup phase')
    })
  })

  describe('After The Upgrade (WORKING phase)', () => {
    beforeEach(async () => {
      await setInitialBalances()
      await rsr.connect(owner).castSpell(forkSpell.address)
    })

    it('should return oldRSR balanceOf or the sum of old + new depending if the balance is crossed', async () => {
      expect(await rsr.balCrossed(addr1.address)).to.eq(false)
      expect(await rsr.balanceOf(addr1.address)).to.eq(await oldRSR.balanceOf(addr1.address))

      expect(await rsr.connect(addr1).transfer(addr2.address, ONE))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr1.address, await oldRSR.balanceOf(addr1.address))
        .and.to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr2.address, ONE)

      expect(await rsr.balCrossed(addr1.address)).to.eq(true)
      expect(await rsr.balanceOf(addr1.address)).to.eq(ONE)
      expect(await rsr.balanceOf(addr1.address)).to.not.eq(await oldRSR.balanceOf(addr1.address))
    })

    it('cannot change weight after RSR Transition', async () => {
      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only mage or owner')
    })

    it('By default the accounts preserve their balances (dont change weight)', async () => {
      expect(await rsr.weights(owner.address, owner.address)).to.equal(0)
      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(0)
      expect(await rsr.weights(addr2.address, addr2.address)).to.equal(0)
      expect(await rsr.balanceOf(owner.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE.mul(2))
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(3))
      expect(await rsr.balCrossed(owner.address)).to.equal(false)
      expect(await rsr.balCrossed(addr1.address)).to.equal(false)
      expect(await rsr.balCrossed(addr2.address)).to.equal(false)
    })

    it('It should mark allowance crossed when using "permit"', async () => {
      expect(await rsr.allowanceCrossed(owner.address, addr1.address)).to.equal(false)
      const permit = await signERC2612Permit(
        ethers.provider,
        rsr.address,
        owner.address,
        addr1.address,
        ONE.toString()
      )

      await expect(
        rsr.permit(owner.address, addr1.address, ONE, permit.deadline, permit.v, permit.r, permit.s)
      )
        .to.emit(rsr, 'Approval')
        .withArgs(owner.address, addr1.address, ONE)

      expect(await rsr.allowanceCrossed(owner.address, addr1.address)).to.equal(true)
      expect(await rsr.allowance(owner.address, addr1.address)).to.equal(ONE)
    })

    it('should cross RSR allowance from oldRSR when increasing/decreasing or approving', async () => {
      expect(await rsr.allowanceCrossed(owner.address, addr3.address)).to.equal(false)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(false)
      expect(await rsr.allowanceCrossed(owner.address, addr1.address)).to.equal(false)
      expect(await oldRSR.allowance(owner.address, addr3.address)).to.equal(
        await rsr.allowance(owner.address, addr3.address)
      )

      await expect(rsr.connect(owner).increaseAllowance(addr3.address, ONE))
        .to.emit(rsr, 'Approval')
        .withArgs(
          owner.address,
          addr3.address,
          await oldRSR.allowance(owner.address, addr3.address)
        )
        .and.to.emit(rsr, 'Approval')
        .withArgs(owner.address, addr3.address, ONE.mul(2))

      await expect(rsr.connect(owner).decreaseAllowance(addr2.address, ONE))
        .to.emit(rsr, 'Approval')
        .withArgs(
          owner.address,
          addr2.address,
          await oldRSR.allowance(owner.address, addr2.address)
        )
        .and.to.emit(rsr, 'Approval')
        .withArgs(owner.address, addr2.address, ZERO)

      await expect(rsr.connect(owner).approve(addr1.address, ONE))
        .to.emit(rsr, 'Approval')
        .withArgs(owner.address, addr1.address, ONE)

      expect(await rsr.allowanceCrossed(owner.address, addr3.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr1.address)).to.equal(true)
      expect(await rsr.allowance(owner.address, addr3.address)).to.equal(ONE.mul(2))
      expect(await rsr.allowance(owner.address, addr2.address)).to.equal(ZERO)
      expect(await oldRSR.allowance(owner.address, addr3.address)).to.equal(ONE)

      // Allowances are already crossed (coverage)
      await expect(rsr.connect(owner).increaseAllowance(addr3.address, ONE))
        .to.emit(rsr, 'Approval')
        .withArgs(owner.address, addr3.address, ONE.mul(3))
    })

    it('should cross balance for sender account without changing the weights', async () => {
      expect(await rsr.connect(addr1).transfer(addr2.address, ZERO))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr1.address, await oldRSR.balanceOf(addr1.address))
        .and.to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr2.address, ZERO)

      // Weights for addr1 should be unchanged
      // The balCrossed flag is turn to true
      expect(await rsr.balCrossed(addr1.address)).to.equal(true)
      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(0)
      expect(await rsr.hasWeights(addr1.address)).to.equal(false)
      // Addr2 should remain unchanged
      expect(await rsr.balCrossed(addr2.address)).to.equal(false)
      expect(await rsr.weights(addr2.address, addr2.address)).to.equal(0)
      expect(await rsr.hasWeights(addr2.address)).to.equal(false)
      // should transfer normally with no changes
      await expect(rsr.connect(addr1).transfer(addr2.address, ONE))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr2.address, ONE)
    })

    it('should cross balances and allowance when using "transferFrom"', async () => {
      expect(await rsr.balCrossed(owner.address)).to.equal(false)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(false)
      expect(await oldRSR.allowance(owner.address, addr2.address)).to.equal(ONE)

      await expect(rsr.connect(addr2).transferFrom(owner.address, addr1.address, ONE.div(2)))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, owner.address, await oldRSR.balanceOf(owner.address))
        .and.to.emit(rsr, 'Approval')
        .withArgs(
          owner.address,
          addr2.address,
          await oldRSR.allowance(owner.address, addr2.address)
        )
        .and.to.emit(rsr, 'Transfer')
        .withArgs(owner.address, addr1.address, ONE.div(2))
        .and.to.emit(rsr, 'Approval')
        .withArgs(owner.address, addr2.address, ONE.div(2))

      expect(await rsr.balCrossed(owner.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr1.address)).to.equal(false)
    })

    it('should not allow token transfer to this address', async () => {
      await expect(rsr.connect(owner).transfer(rsr.address, ONE)).to.be.reverted
      await expect(rsr.connect(owner).transferFrom(owner.address, rsr.address, ONE)).to.be.reverted
    })

    describe('Pausing', () => {
      beforeEach(async () => {
        await expect(rsr.connect(owner).pause()).to.emit(rsr, 'Paused').withArgs(owner.address)
      })

      it('should revert transfer', async () => {
        await expect(rsr.connect(addr1).transfer(addr2.address, 1)).to.be.revertedWith(
          'Pausable: paused'
        )
      })

      it('should revert transferFrom', async () => {
        await expect(
          rsr.connect(addr1).transferFrom(addr1.address, addr2.address, 1)
        ).to.be.revertedWith('Pausable: paused')
      })

      it('should revert approve', async () => {
        await expect(rsr.connect(addr1).approve(addr2.address, 1)).to.be.revertedWith(
          'Pausable: paused'
        )
      })

      it('should revert permit', async () => {
        const permit = await signERC2612Permit(
          ethers.provider,
          rsr.address,
          owner.address,
          addr1.address,
          '0'
        )

        await expect(
          rsr
            .connect(addr1)
            .permit(owner.address, addr1.address, 0, permit.deadline, permit.v, permit.r, permit.s)
        ).to.be.revertedWith('Pausable: paused')
      })

      it('should revert increaseAllowance', async () => {
        await expect(rsr.connect(addr1).increaseAllowance(addr2.address, 1)).to.be.revertedWith(
          'Pausable: paused'
        )
      })

      it('should revert decreaseAllowance', async () => {
        await expect(rsr.connect(addr1).decreaseAllowance(addr2.address, 1)).to.be.revertedWith(
          'Pausable: paused'
        )
      })

      it('should change pauser address and unpause', async () => {
        await expect(rsr.connect(owner).changePauser(addr1.address))
          .to.emit(rsr, 'PauserChanged')
          .withArgs(owner.address, addr1.address)
        expect(await rsr.pauser()).to.equal(addr1.address)
        await expect(rsr.connect(addr1).unpause()).to.emit(rsr, 'Unpaused').withArgs(addr1.address)
      })
    })
  })

  describe('Partial Crossover', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('should cross partially for account with multiple fund sources', async () => {
      await castSiphons({ from: owner.address, to: addr2.address, weight: WEIGHT_ONE })
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE })

      await rsr.connect(owner).castSpell(forkSpell.address)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(6))
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(6))

      await expect(rsr.connect(addr1).partiallyCross(addr2.address, 2))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(1))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(2))
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(3))
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(6))

      await expect(rsr.connect(addr1).partiallyCross(addr2.address, 1e12)).to.not.emit
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(3))
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(6))

      await expect(rsr.connect(addr2).transfer(addr2.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr2.address, addr2.address, 0)
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(3))
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(3))
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(6))
    })

    it('should be idempotent before crossing for both hasWeights and !hasWeights', async () => {
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })

      await rsr.connect(owner).castSpell(forkSpell.address)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).partiallyCross(addr1.address, 1e12))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr1.address, ONE)
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      // TODO: Here we would like to assert two Transfers are emitted, but we can't due to waffle limitations
      await expect(rsr.connect(addr1).partiallyCross(addr2.address, 1e12))
      // .to.emit(rsr, 'Transfer')
      // .withArgs(ZERO_ADDRESS, addr2.address, ONE)
      // .to.emit(rsr, 'Transfer')
      // .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(3))
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).transfer(addr1.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr1.address, 0)
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).transfer(addr2.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr2.address, addr2.address, 0)
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))
    })

    it('should be idempotent after crossing for both hasWeights and !hasWeights', async () => {
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })

      await rsr.connect(owner).castSpell(forkSpell.address)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).transfer(addr1.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr1.address, 0)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).transfer(addr2.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr2.address, addr2.address, 0)
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(4))
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).partiallyCross(addr1.address, 1e12)).to.not.emit
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).partiallyCross(addr2.address, 1e12)).to.not.emit
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))
    })

    it('should be idempotent between two accounts with different crossing statuses', async () => {
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })

      await rsr.connect(owner).castSpell(forkSpell.address)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).transfer(addr1.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr1.address, 0)
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr1.address, ONE)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).partiallyCross(addr1.address, 1e12)).to.not.emit
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).partiallyCross(addr2.address, 1e12))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(3))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).transfer(addr2.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(3))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr2.address, addr2.address, 0)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(3))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))
    })

    it('should be idempotent between two accounts with different crossing statuses, other direction', async () => {
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })

      await rsr.connect(owner).castSpell(forkSpell.address)
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).transfer(addr2.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr2.address, addr2.address, 0)
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr2.address, ONE.mul(4))
      expect(await rsr.oldBal(addr1.address)).to.equal(ONE)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr2).partiallyCross(addr1.address, 1e12))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, addr1.address, ONE)
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.oldBal(addr2.address)).to.equal(ONE.mul(4))
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).partiallyCross(addr2.address, 1e12)).to.not.emit
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))

      await expect(rsr.connect(addr1).transfer(addr1.address, 0))
        .to.emit(rsr, 'Transfer')
        .withArgs(addr1.address, addr1.address, 0)
      expect(await rsr.oldBal(addr1.address)).to.equal(0)
      expect(await rsr.balanceOf(addr1.address)).to.equal(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.equal(ONE.mul(4))
    })
  })
})
