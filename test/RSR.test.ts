import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { signERC2612Permit } from 'eth-permit'
import { BigNumberish, ContractFactory } from 'ethers'
import { ethers } from 'hardhat'

import { bn, ONE, ZERO } from '../common/numbers'
import { ERC20Mock, ReserveRightsTokenMock, RSR, SiphonSpell, UpgradeSpell } from '../typechain'

let owner: SignerWithAddress
let addr1: SignerWithAddress
let addr2: SignerWithAddress
let addr3: SignerWithAddress
let oldRSR: ReserveRightsTokenMock
let SiphonSpellFactory: ContractFactory
let UpgradeSpellFactory: ContractFactory
let upgradeSpell: UpgradeSpell
let rsr: RSR
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ONE_ADDRESS = '0x0000000000000000000000000000000000000001'
const WEIGHT_ONE = bn('1e18')

async function setInitialBalances() {
  await oldRSR.mint(owner.address, ONE)
  await oldRSR.mint(addr1.address, ONE.mul(2))
  await oldRSR.mint(addr2.address, ONE.mul(3))
  await oldRSR.connect(owner).approve(addr3.address, ONE)
  await oldRSR.connect(owner).approve(addr2.address, ONE)
}

interface Siphon {
  from: string
  to: string
  weight: BigNumberish
}

async function castSiphons(...siphons: Siphon[]) {
  const siphonSpell = <SiphonSpell>(
    await SiphonSpellFactory.connect(owner).deploy(rsr.address, siphons)
  )
  await rsr.connect(owner).castSpell(siphonSpell.address)
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
    const RSR = await ethers.getContractFactory('RSR')
    rsr = <RSR>await RSR.connect(owner).deploy(oldRSR.address)
    // Spells
    SiphonSpellFactory = await ethers.getContractFactory('SiphonSpell')
    UpgradeSpellFactory = await ethers.getContractFactory('UpgradeSpell')
    upgradeSpell = <UpgradeSpell>await UpgradeSpellFactory.deploy(oldRSR.address, rsr.address)
    oldRSR.connect(owner).addPauser(upgradeSpell.address)
  })

  describe('Deployment', () => {
    it('should inherit the total supply for the old RSR', async () => {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
    })
  })

  describe('Prior to the upgrade', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('dont allow siphon if oldRSR is paused', async () => {
      await oldRSR.connect(owner).pause()
      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('old RSR is already paused')
    })

    it('dont allow siphon if from is the zero address', async () => {
      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('from cannot be zero address')
    })

    it('cannot change weight if the account is not the owner', async () => {
      await expect(
        rsr.connect(addr1).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only regent or owner')
    })

    it('should allow changing balance at zero address (owner only)', async () => {
      await expect(rsr.connect(addr1).changeBalanceAtZeroAddress(ONE)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )

      await expect(rsr.connect(owner).changeBalanceAtZeroAddress(ONE))
        .to.emit(rsr, 'Transfer')
        .withArgs(ZERO_ADDRESS, ONE_ADDRESS, ONE)
      await expect(rsr.connect(owner).changeBalanceAtZeroAddress(bn('-1e18').div(2)))
        .to.emit(rsr, 'Transfer')
        .withArgs(ONE_ADDRESS, ZERO_ADDRESS, ONE.div(2))
      // do nothing if amount is zero (coverage purposes)
      await expect(rsr.connect(owner).changeBalanceAtZeroAddress(ZERO)).to.not.emit(rsr, 'Transfer')
      expect(await rsr.balanceOf(ONE_ADDRESS)).to.eq(ONE.div(2))
    })

    it('should not allow RSR transfers or approvals until oldRSR is paused', async () => {
      const permit = await signERC2612Permit(
        ethers.provider,
        rsr.address,
        owner.address,
        addr1.address,
        '0'
      )

      await expect(rsr.connect(owner).transfer(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
      await expect(
        rsr.connect(owner).transferFrom(owner.address, addr1.address, 0)
      ).to.be.revertedWith('waiting for oldRSR to pause')
      await expect(rsr.connect(owner).approve(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
      await expect(
        rsr
          .connect(owner)
          .permit(owner.address, addr1.address, '0', permit.deadline, permit.v, permit.r, permit.s)
      ).to.be.revertedWith('waiting for oldRSR to pause')
      await expect(rsr.connect(owner).increaseAllowance(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
      await expect(rsr.connect(owner).decreaseAllowance(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
    })

    it('should cast siphon without change', async () => {
      await castSiphons({ from: addr1.address, to: addr1.address, weight: 0 })
      expect(await rsr.regent()).to.equal(ZERO_ADDRESS)
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

      await rsr.connect(owner).castSpell(siphonSpell.address)
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
  })

  describe('The Upgrade', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('does the upgrade', async () => {
      await rsr.connect(owner).castSpell(upgradeSpell.address)
    })

    it('reverts if not pauser of oldRSR', async () => {
      const newUpgradeSpell = <UpgradeSpell>(
        await UpgradeSpellFactory.deploy(oldRSR.address, rsr.address)
      )
      await expect(rsr.connect(owner).castSpell(newUpgradeSpell.address)).to.be.reverted
    })

    it('The transition is only complete if RSR dont have an owner', async () => {
      await oldRSR.connect(owner).pause()
      await expect(rsr.connect(owner).transfer(addr1.address, ONE)).to.be.reverted
    })

    it('should only upgrade once', async () => {
      await rsr.connect(owner).castSpell(upgradeSpell.address)
      await expect(rsr.connect(owner).castSpell(upgradeSpell.address)).to.be.reverted

      const newUpgradeSpell = <UpgradeSpell>(
        await UpgradeSpellFactory.deploy(oldRSR.address, rsr.address)
      )
      await oldRSR.addPauser(newUpgradeSpell.address)
      await expect(rsr.connect(owner).castSpell(newUpgradeSpell.address)).to.be.reverted
    })

    it('should calculate balances correctly after siphon', async () => {
      await castSiphons({ from: addr1.address, to: addr2.address, weight: WEIGHT_ONE.div(2) })
      await castSiphons({ from: addr2.address, to: addr3.address, weight: WEIGHT_ONE })
      await rsr.connect(owner).castSpell(upgradeSpell.address)
      expect(await rsr.balanceOf(addr1.address)).to.eq(ONE)
      expect(await rsr.balanceOf(addr2.address)).to.eq(ONE)
      expect(await rsr.balanceOf(addr3.address)).to.eq(ONE.mul(3))
    })
  })

  describe('After The Upgrade (default settings)', () => {
    beforeEach(async () => {
      await setInitialBalances()
      await rsr.connect(owner).castSpell(upgradeSpell.address)
    })

    it('should return oldRSR balanceOf or the sum of old + new depending if the balance is crossed', async () => {
      expect(await rsr.balCrossed(addr1.address)).to.eq(false)
      expect(await rsr.balanceOf(addr1.address)).to.eq(await oldRSR.balanceOf(addr1.address))
      await rsr.connect(addr1).transfer(addr2.address, ONE)
      expect(await rsr.balCrossed(addr1.address)).to.eq(true)
      expect(await rsr.balanceOf(addr1.address)).to.eq(ONE)
      expect(await rsr.balanceOf(addr1.address)).to.not.eq(await oldRSR.balanceOf(addr1.address))
    })

    it('cannot change weight after RSR Transition', async () => {
      await expect(
        rsr.connect(owner).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only regent or owner')
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

      await rsr.permit(
        owner.address,
        addr1.address,
        ONE,
        permit.deadline,
        permit.v,
        permit.r,
        permit.s
      )

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

      await rsr.connect(owner).increaseAllowance(addr3.address, ONE)
      await rsr.connect(owner).decreaseAllowance(addr2.address, ONE)
      await rsr.connect(owner).approve(addr1.address, ONE)
      expect(await rsr.allowanceCrossed(owner.address, addr3.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr1.address)).to.equal(true)
      expect(await rsr.allowance(owner.address, addr3.address)).to.equal(ONE.mul(2))
      expect(await rsr.allowance(owner.address, addr2.address)).to.equal(ZERO)
      expect(await oldRSR.allowance(owner.address, addr3.address)).to.equal(ONE)
      // Allowances are already crossed (coverage)
      await rsr.connect(owner).increaseAllowance(addr3.address, ONE)
    })

    it('should cross balance for sender account without changing the weights', async () => {
      await rsr.connect(addr1).transfer(addr2.address, ZERO)

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
      await expect(rsr.connect(addr1).transfer(addr2.address, ONE)).to.be.not.reverted
    })

    it('should cross balances and allowance when using "transferFrom"', async () => {
      expect(await rsr.balCrossed(owner.address)).to.equal(false)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(false)
      expect(await oldRSR.allowance(owner.address, addr2.address)).to.equal(ONE)

      await rsr.connect(owner).approve(addr1.address, ONE)
      await rsr.connect(addr1).transferFrom(owner.address, addr2.address, ONE.div(2))
      expect(await rsr.balCrossed(owner.address)).to.equal(true)
      expect(await rsr.allowanceCrossed(owner.address, addr2.address)).to.equal(true)
    })

    it('should not allow token transfer to this address', async () => {
      await expect(rsr.connect(owner).transfer(rsr.address, ONE)).to.be.reverted
    })
  })
})
