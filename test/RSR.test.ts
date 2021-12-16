import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

import { MockERC20 } from '../typechain/MockERC20.d'
import { ReserveRightsTokenMock } from '../typechain/ReserveRightsTokenMock.d'
import { RSR } from '../typechain/RSR.d'

let owner: SignerWithAddress
let addr1: SignerWithAddress
let addr2: SignerWithAddress
let oldRSR: ReserveRightsTokenMock
let rsr: RSR

describe('RSR contract', function () {
  beforeEach(async function () {
    ;[owner, addr1, addr2] = await ethers.getSigners()
    // Deploy MockERC20 to stand-in for oldOldRSR
    const OldOldRSR = await ethers.getContractFactory('MockERC20')
    const oldOldRSR = <MockERC20>await OldOldRSR.deploy('Reserve Rights', 'RSR')
    // Deploy Previous RSR (Pausable)
    const OldRSR = await ethers.getContractFactory('ReserveRightsTokenMock')
    oldRSR = <ReserveRightsTokenMock>await OldRSR.deploy(oldOldRSR.address)
    await oldRSR.mint(owner.address, BigNumber.from(1000))
    await oldRSR.mint(addr1.address, BigNumber.from(2000))
    await oldRSR.mint(addr2.address, BigNumber.from(3000))
    await oldRSR.connect(owner).approve(addr1.address, BigNumber.from(500))
    await oldRSR.connect(addr2).approve(addr1.address, BigNumber.from(200))
    // Deploy new RSR
    const RSR = await ethers.getContractFactory('RSR')
    rsr = <RSR>await RSR.connect(owner).deploy(oldRSR.address)
  })
  describe('Deployment', function () {
    it('Should setup correctly', async () => {})
    it('Should start with the total supply of previous RSR', async function () {
      const totalSupplyPrev = await oldRSR.totalSupply()
      expect(await rsr.totalSupply()).to.equal(totalSupplyPrev)
    })
    // it('Should setup correctly initial values', async function () {
    //   const totalSupply = await rsr.totalSupply()
    //   expect(await rsr.fixedSupply()).to.equal(totalSupply)
    //   //expect(await rsr.snapshotter()).to.equal(owner.address);
    //   expect(await rsr.slowWallet()).to.equal(slowWallet.address)
    //   expect(await rsr.multisigWallet()).to.equal(multisigWallet.address)
    // })
  })
  // describe('Balances and Transfers - Before Pausing Previous RSR', function () {
  //   it('Should return balances from previous RSR if not crossed', async function () {
  //     // Compare balances between contracts
  //     expect(await rsr.balanceOf(owner.address)).to.equal(await oldRSR.balanceOf(owner.address))
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(await oldRSR.balanceOf(addr1.address))
  //     expect(await rsr.balanceOf(addr2.address)).to.equal(await oldRSR.balanceOf(addr2.address))
  //     // Ensure no tokens where crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(false)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //     expect(await rsr.crossed(addr2.address)).to.equal(false)
  //   })
  //   it('Should not populate allowances from previous RSR', async function () {
  //     expect(await rsr.allowance(owner.address, addr1.address)).to.equal(0)
  //     expect(await rsr.allowance(addr2.address, addr1.address)).to.equal(0)
  //     // No tokens where crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(false)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //     expect(await rsr.crossed(addr2.address)).to.equal(false)
  //   })
  //   it('Should not transfer tokens between accounts if Previous RSR is not paused', async function () {
  //     // Transfer 50 tokens from owner to addr1
  //     const amount = BigNumber.from(50)
  //     const addr1BalancePrev = await rsr.balanceOf(addr1.address)
  //     await expect(rsr.connect(owner).transfer(addr1.address, amount)).to.be.revertedWith(
  //       'ERC20: transfer amount exceeds balance'
  //     )
  //     const addr1Balance = await rsr.balanceOf(addr1.address)
  //     expect(addr1Balance).to.equal(addr1BalancePrev)
  //     // No tokens crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(false)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //   })
  //   it('Should not transferFrom tokens between accounts if Previous RSR is not paused', async function () {
  //     // Transfer 500 tokens from owner to addr2, handled by addr1 (allowance)
  //     const amount = BigNumber.from(500)
  //     const addr2BalancePrev = await rsr.balanceOf(addr2.address)
  //     await expect(
  //       rsr.connect(addr1).transferFrom(owner.address, addr2.address, amount)
  //     ).to.be.revertedWith('ERC20: transfer amount exceeds balance')
  //     const addr2Balance = await rsr.balanceOf(addr2.address)
  //     expect(addr2Balance).to.equal(addr2BalancePrev)
  //     // No tokens crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(false)
  //     expect(await rsr.crossed(addr2.address)).to.equal(false)
  //   })
  //   it('Should allow to grant allowances between accounts even if Previous RSR is not paused', async function () {
  //     const amount = BigNumber.from(100)
  //     // Grant allowance
  //     await rsr.connect(owner).approve(addr1.address, amount)
  //     const addr1Allowance = await rsr.allowance(owner.address, addr1.address)
  //     expect(addr1Allowance).to.equal(amount)
  //     // No tokens crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(false)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //   })
  // })
  // describe('Balances and Transfers - After Pausing Previous RSR', function () {
  //   let totalSupply: BigNumber
  //   beforeEach(async function () {
  //     // Pause previous contract
  //     await oldRSR.connect(owner).pause()
  //     totalSupply = await rsr.totalSupply()
  //   })
  //   it('Should transfer tokens between accounts and cross sender', async function () {
  //     // Transfer 50 tokens from owner to addr1
  //     const amount = BigNumber.from(50)
  //     const ownerBalancePrev = await rsr.balanceOf(owner.address)
  //     const addr1BalancePrev = await rsr.balanceOf(addr1.address)
  //     // Perform transfer
  //     await rsr.connect(owner).transfer(addr1.address, amount)
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev.add(amount))
  //     expect(await rsr.balanceOf(owner.address)).to.equal(ownerBalancePrev.sub(amount))
  //     // Check owner has crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(true)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //   })
  //   it('Should transferFrom tokens between accounts and cross sender', async function () {
  //     // Transfer 50 tokens from owner to addr1
  //     const amount = BigNumber.from(500)
  //     const ownerBalancePrev = await rsr.balanceOf(owner.address)
  //     const addr2BalancePrev = await rsr.balanceOf(addr2.address)
  //     // Set allowance and transfer
  //     await rsr.connect(owner).approve(addr1.address, amount)
  //     await rsr.connect(addr1).transferFrom(owner.address, addr2.address, amount)
  //     expect(await rsr.balanceOf(addr2.address)).to.equal(addr2BalancePrev.add(amount))
  //     expect(await rsr.balanceOf(owner.address)).to.equal(ownerBalancePrev.sub(amount))
  //     // Check owner has crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(true)
  //     expect(await rsr.crossed(addr2.address)).to.equal(false)
  //   })
  //   it('Should not transfer tokens to self', async function () {
  //     // Transfer 50 tokens from owner to RSR address
  //     const amount = BigNumber.from(50)
  //     // Try to perform transfer, should fail
  //     await expect(rsr.connect(owner).transfer(rsr.address, amount)).to.be.revertedWith(
  //       'TransferToContractAddress'
  //     )
  //   })
  //   it('Should cross only once with consecutive transfers', async function () {
  //     // Transfer 50 tokens from owner to addr1
  //     const amount1 = BigNumber.from(50)
  //     const amount2 = BigNumber.from(100)
  //     const ownerBalancePrev = await rsr.balanceOf(owner.address)
  //     const addr1BalancePrev = await rsr.balanceOf(addr1.address)
  //     // Perform transfer
  //     await rsr.connect(owner).transfer(addr1.address, amount1)
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev.add(amount1))
  //     expect(await rsr.balanceOf(owner.address)).to.equal(ownerBalancePrev.sub(amount1))
  //     // Check owner has crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(true)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //     // Perform second transfer of 50 tokens from owner to addr1
  //     await rsr.connect(owner).transfer(addr1.address, amount2)
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(
  //       addr1BalancePrev.add(amount1).add(amount2)
  //     )
  //     expect(await rsr.balanceOf(owner.address)).to.equal(
  //       ownerBalancePrev.sub(amount1).sub(amount2)
  //     )
  //     // Check owner has crossed
  //     expect(await rsr.crossed(owner.address)).to.equal(true)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //   })
  //   it('Should add slowWallet balance when crossing multisig', async function () {
  //     // Transfer tokens from multisig to addr1
  //     const amount = BigNumber.from(200)
  //     const multisigBalancePrev = await rsr.balanceOf(multisigWallet.address)
  //     const slowWalletBalancePrev = await rsr.balanceOf(slowWallet.address)
  //     const addr1BalancePrev = await rsr.balanceOf(addr1.address)
  //     // Perform transfer from multisig
  //     await rsr.connect(multisigWallet).transfer(addr1.address, amount)
  //     expect(await rsr.balanceOf(addr1.address)).to.equal(addr1BalancePrev.add(amount))
  //     expect(await rsr.balanceOf(multisigWallet.address)).to.equal(
  //       multisigBalancePrev.add(slowWalletBalancePrev).sub(amount)
  //     )
  //     expect(await rsr.balanceOf(slowWallet.address)).to.equal(0)
  //     // Check multisig and slowWallet have crossed
  //     expect(await rsr.crossed(multisigWallet.address)).to.equal(true)
  //     expect(await rsr.crossed(slowWallet.address)).to.equal(true)
  //     expect(await rsr.crossed(addr1.address)).to.equal(false)
  //   })
  // })
})
