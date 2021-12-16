import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumberish, ContractFactory } from 'ethers'
import { ethers } from 'hardhat'

import { ONE, ZERO } from '../common/numbers'
import { ERC20Mock, ReserveRightsTokenMock, RSR, SiphonSpell } from '../typechain'

// eslint-disable-next-line node/no-missing-import
let owner: SignerWithAddress
let addr1: SignerWithAddress
let addr2: SignerWithAddress
let addr3: SignerWithAddress
let oldRSR: ReserveRightsTokenMock
let SiphonSpellFactory: ContractFactory
let rsr: RSR
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const WEIGHT_ONE = 1000

async function setInitialBalances() {
  await oldRSR.mint(owner.address, ONE)
  await oldRSR.mint(addr1.address, ONE.mul(2))
  await oldRSR.mint(addr2.address, ONE.mul(3))
}

async function pauseOldRSR() {
  await oldRSR.connect(owner).pause()
  await rsr.renounceOwnership()
}
async function castSiphonSpell(from: string, to: string, weight: BigNumberish) {
  const siphonSpell = <SiphonSpell>(
    await SiphonSpellFactory.connect(owner).deploy(rsr.address, owner.address)
  )
  await siphonSpell.connect(owner).planSiphon(from, { to: to, weight: weight })
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
    SiphonSpellFactory = await ethers.getContractFactory('SiphonSpell')
  })

  describe('Deployment', () => {
    it('Should inherit the total supply for the old RSR', async () => {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
    })
  })

  describe('Transition state', () => {
    beforeEach(async () => {
      await setInitialBalances()
    })

    it('cannot change weight if the account is not the owner', async () => {
      await expect(
        rsr.connect(addr1).siphon(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, WEIGHT_ONE)
      ).to.be.revertedWith('only regent or owner')
    })

    it('should transition via a spell', async () => {
      await castSiphonSpell(addr1.address, addr1.address, 0)
      expect(await rsr.regent()).to.equal(ZERO_ADDRESS)
      expect(await rsr.owner()).to.equal(owner.address)
    })
  })

  it('should change the account weight', async () => {
    await castSiphonSpell(addr1.address, addr1.address, WEIGHT_ONE)
    expect(await rsr.balCrossed(addr1.address)).to.equal(false)
    expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE)
    expect(await rsr.hasWeights(addr1.address)).to.equal(true)
  })

  it('should distribute the weights correctly for the given account', async () => {
    expect(await rsr.hasWeights(addr1.address)).to.equal(false)
    expect(await rsr.hasWeights(addr2.address)).to.equal(false)
    expect(await rsr.hasWeights(addr3.address)).to.equal(false)
    await castSiphonSpell(addr1.address, addr2.address, WEIGHT_ONE / 2)

    expect(await rsr.weights(addr1.address, addr1.address)).to.equal(WEIGHT_ONE / 2)
    expect(await rsr.weights(addr1.address, addr2.address)).to.equal(WEIGHT_ONE / 2)

    await castSiphonSpell(addr1.address, addr3.address, WEIGHT_ONE / 4)

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

  describe('After RSR Transition (void state)', () => {
    beforeEach(async () => {
      await setInitialBalances()
      await pauseOldRSR()
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

    it('Should cross balance for sender account without changing the weights', async () => {
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

// describe('Deployment', function () {
//   it('Should inherit the total supply for the old RSR', async () => {
//     const totalSupplyPrev = await oldRSR.totalSupply()
//     expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
//   })

//   describe('Balances and Transfers - Before Pausing Previous RSR', () => {
//     it('Should return balances from previous RSR if not crossed', async () => {
//       // Compare balances between contracts
//       expect(await rsr.balanceOf(owner.address)).to.equal(await oldRSR.balanceOf(owner.address))
//       expect(await rsr.balanceOf(addr1.address)).to.equal(await oldRSR.balanceOf(addr1.address))

//       // Ensure no tokens were crossed
//       expect(await rsr.balCrossed(owner.address)).to.equal(false)
//       expect(await rsr.balCrossed(addr1.address)).to.equal(false)
//     })

//     it('Should not allow to transfer tokens between accounts', async () => {
//       const ownerBalancePrev = await rsr.balanceOf(owner.address)
//       const addr1BalancePrev = await rsr.balanceOf(addr1.address)

//       // Attempt to  transfer
//       await expect(
//         rsr.connect(owner).transfer(addr1.address, BigNumber.from(50000))
//       ).to.be.revertedWith('waiting for oldRSR to pause')

//       // Balances remain unchanged
//       expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev)
//       expect(await rsr.balanceOf(owner.address)).to.equal(ownerBalancePrev)

//       // Check owner has not crossed
//       expect(await rsr.balCrossed(owner.address)).to.equal(false)
//       expect(await rsr.balCrossed(addr1.address)).to.equal(false)
//     })
//   })

//   describe('Balances and Transfers - After Pausing Previous RSR', function () {
//     // let totalSupply: BigNumber

//     beforeEach(async function () {
//       // Pause previous contract
//       await oldRSR.connect(owner).pause({})

//       // Renounce ownership of new RSR
//       await rsr.connect(owner).renounceOwnership()

//       expect(await oldRSR.paused()).to.equal(true)
//       // totalSupply = await rsr.totalSupply()
//     })

//     // it('Should transfer tokens between accounts and cross sender', async function () {
//     //   // Transfer 50 tokens from holder to addr1
//     //   const amount = BigNumber.from(50000)
//     //   const holderBalancePrev = await rsr.balanceOf(owner.address)
//     //   const addr1BalancePrev = await rsr.balanceOf(addr1.address)

//     //   // Perform transfer
//     //   await rsr.connect(owner).transfer(addr1.address, amount)

//     //   expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev.add(amount))
//     //   expect(await rsr.balanceOf(owner.address)).to.equal(holderBalancePrev.sub(amount))

//     //   // Check owner has crossed
//     //   expect(await rsr.balCrossed(owner.address)).to.equal(true)
//     //   expect(await rsr.balCrossed(addr1.address)).to.equal(false)
//     // })
//   })
// })
// })
