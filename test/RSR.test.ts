import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumberish, ContractFactory } from 'ethers'
import { ethers } from 'hardhat'

import { ONE, ZERO } from '../common/numbers'
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
const WEIGHT_ONE = 1000

async function setInitialBalances() {
  await oldRSR.mint(owner.address, ONE)
  await oldRSR.mint(addr1.address, ONE.mul(2))
  await oldRSR.mint(addr2.address, ONE.mul(3))
  await oldRSR.connect(owner).approve(addr3.address, ONE)
  await oldRSR.connect(owner).approve(addr2.address, ONE)
}

async function castSiphon(from: string, to: string, weight: BigNumberish) {
  const siphonSpell = <SiphonSpell>(
    await SiphonSpellFactory.connect(owner).deploy(rsr.address, owner.address)
  )
  await siphonSpell.connect(owner).planSiphon(from, { to: to, weight: weight })
  await rsr.connect(owner).castSpell(siphonSpell.address)
}

describe.only('RSR contract', () => {
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
    it('Should inherit the total supply for the old RSR', async () => {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
    })
  })

  describe('Prior to the upgrade', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('cannot change weight if the account is not the owner', async () => {
      await expect(
        rsr.connect(addr1).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only regent or owner')
    })

    it('should not allow RSR transfers or approvals until oldRSR is paused', async () => {
      await expect(rsr.connect(owner).transfer(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
      await expect(
        rsr.connect(owner).transferFrom(owner.address, addr1.address, 0)
      ).to.be.revertedWith('waiting for oldRSR to pause')
      await expect(rsr.connect(owner).approve(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
      // TODO: Missing values for the bytes32 params
      // await expect(
      //   rsr.connect(owner).permit(owner.address, addr1.address, 0, 0, 0, ZERO_ADDRESS, ZERO_ADDRESS)
      // ).to.be.revertedWith('waiting for oldRSR to pause')
      await expect(rsr.connect(owner).increaseAllowance(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
      await expect(rsr.connect(owner).decreaseAllowance(addr1.address, 0)).to.be.revertedWith(
        'waiting for oldRSR to pause'
      )
    })

    it('should cast siphon without change', async () => {
      await castSiphon(addr1.address, addr1.address, 0)
      expect(await rsr.regent()).to.equal(ZERO_ADDRESS)
      expect(await rsr.owner()).to.equal(owner.address)
    })

    it('should cast siphon with change', async () => {
      await castSiphon(addr1.address, addr1.address, WEIGHT_ONE)
      expect(await rsr.balCrossed(addr1.address)).to.equal(false)
      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE)
      expect(await rsr.hasWeights(addr1.address)).to.equal(true)
    })

    it('should distribute the weights correctly for the given account', async () => {
      expect(await rsr.hasWeights(addr1.address)).to.equal(false)
      expect(await rsr.hasWeights(addr2.address)).to.equal(false)
      expect(await rsr.hasWeights(addr3.address)).to.equal(false)
      await castSiphon(addr1.address, addr2.address, WEIGHT_ONE / 2)

      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE / 2)
      expect(await rsr.weights(addr1.address, addr2.address)).to.equal(WEIGHT_ONE / 2)

      await castSiphon(addr1.address, addr3.address, WEIGHT_ONE / 4)

      expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE / 4)
      expect(await rsr.weights(addr1.address, addr3.address)).to.equal(WEIGHT_ONE / 4)
      expect(await rsr.weights(addr1.address, addr2.address)).to.equal(WEIGHT_ONE / 2)
      expect(await rsr.hasWeights(addr1.address)).to.equal(true)
      // Only move sender weight not recipient
      expect(await rsr.hasWeights(addr2.address)).to.equal(false)
      expect(await rsr.hasWeights(addr3.address)).to.equal(false)
    })

    it('should not distribute more weight than the current account has', async () => {
      await rsr.connect(owner).siphon(addr1.address, addr1.address, addr2.address, WEIGHT_ONE / 2)
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
      await castSiphon(addr1.address, addr2.address, WEIGHT_ONE / 2)
      await castSiphon(addr2.address, addr3.address, WEIGHT_ONE)
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
    })
  })
})
