# Mainnet RSR

[![Tests](https://github.com/reserve-protocol/rsr-mainnet/actions/workflows/tests.yml/badge.svg)](https://github.com/reserve-protocol/rsr-mainnet/actions/workflows/tests.yml)

This repo contains the code for a mainnet Reserve Rights token (RSR), on Ethereum at `0x320623b8e4ff03373931769a31fc52a4e78b5d70`, which was activated Jan 13 at 4pm Pacific Time. The major content of this contract is its ability to fork balances from the old, paused contract.

This is a token fork from a [previously deployed version of RSR](https://github.com/reserve-protocol/rsr), on Ethereum at `0x8762db106b2c2a0bccb3a80d1ed41273552616e8`. The old RSR contract is (as of Jan 13) paused and cannot be unpaused.

## Integration: Wallets + Exchanges

Wallets and Exchanges that list Mainnet RSR most likely need to write specific logic in order for their systems to track new RSR balances correctly. In particular, **wallets and exchanges may not be able to form a _complete_ picture of token balances if they rely solely on events**. Although `balanceOf()` will always return the correct balance for all accounts, it is possible in the new RSR to have a non-zero balance but no related transfer events. When an account that had a balance on the old contract makes their first transfer on the new contract, two events will be emitted: one for the "crossing" of the balance to the new contract, and one for the outgoing transfer amount. The "crossing" will look like a mint, i.e an incoming transfer from the zero address. Hence, it is possible to ignore the "crossing" event simply by ignoring all transfer events from the zero address. Since RSR is a fixed-supply token, this can be done safely.

Here is an example tx showing the pattern: https://etherscan.io/tx/0xcb68bf9a7bb0901ffa47e8b9232d0743c4998f6b9ba250eb3c696cc016959c21

Implications:

- If you are an exchange or wallet that was never integrated with old RSR, then parsing events will work on the new contract the way you're used to. All the accounts in this case will have never held a balance on the old RSR.
- If you were previously integrated with old RSR and are trying to integrate with new RSR, **you will need to ignore transfers whose source is the zero address**. Otherwise, it is possible your systems could double a user's balance by accidentally crediting them a second time for an amount equal to the balance they already have.

## Deployments

### Network: Mainnet

RSR

- Pre-mainnet deployment: https://etherscan.io/token/0x8762db106b2c2a0bccb3a80d1ed41273552616e8
- Post-mainnet deployment: https://etherscan.io/token/0x320623b8e4ff03373931769a31fc52a4e78b5d70

Fork Spell

- https://etherscan.io/address/0x53b968caf6a1715caa8fa3f0fb63e8d09a6433e1

Slow Wallet

- https://etherscan.io/address/0x6bab6eb87aa5a1e4a8310c73bdaaa8a5daad81c1

Siphon Spell

- https://etherscan.io/address/0x3eb1438b1edff7d899a863d4792e8d8f7d455277

### Network: Ropsten

RSR

- Pre-mainnet deployment: https://ropsten.etherscan.io/token/0x58408daf0664dc9ff4645414ce5f9ace059f0470
- Post-mainnet deployment: https://ropsten.etherscan.io/token/0x320623b8e4ff03373931769a31fc52a4e78b5d70

Fork Spell

- https://etherscan.io/address/0x53b968caf6a1715caa8fa3f0fb63e8d09a6433e1

Slow Wallet

- https://ropsten.etherscan.io/address/0x6bab6EB87Aa5a1e4A8310C73bDAAA8A5dAAd81C1

## Context

We need to upgrade our old RSR contract, mostly to unlock tokens on the old RSR contract that were "locked forever" -- with the intent of staying locked until our mainnet protocol launch. Now that our mainnet protocol is on its way, we need to deploy an upgraded RSR so that it can be in use in advance of that protocol's launch.

The transfer of tokens from the old RSR contract to the new one is intended to be entirely automatic. The new RSR contract is aware of the old RSR contract, and it will simply use the old RSR’s balances as the starting balances of new RSR accounts. We do this, here, by overriding the `transfer`, `transferFrom`, and `balanceOf` functions in order to implement the [copy-on-write pattern](https://en.wikipedia.org/wiki/Copy-on-write). (Alternately, think of this as a lazy copy of all balances.)

## Weights and Balance Crossings

But this implementation is definitely not as simple as a lazy copy; for a handful of addresses, we also need to change the owning address, and we sometimes need to divvy the balance at an old address among several new addresses. To accommodate this, we set up a matrix of weights to be consulted during the "copy" step of that copy-on-write, which we configure after we deploy this RSR contract and before we pause-and-transition balances from the old RSR contract.

Instead, imagine for a moment that we have a matrix totalWeights, of type mapping(address => mapping(address => uint16)). By default, we start with

    totalWeights[old][new] == (old == new) ? WEIGHT_ONE : 0

Before transitions, every time the admin calls siphon(old, prev, to, weight), we do

    totalWeights[old][prev] -= weight;
    totalWeights[old][to]   += weight;

When we read new balances, then, for any address A, the inherited balanceOf(A) is:

    sum_{all addresses B} ( totalWeights[B][A] * oldRSR.balanceOf(B) / WEIGHT_ONE; )

---

But it's not quite that simple, either. Because gas, we don't want to initialize a matrix with at least one nonzero values for each address that holds some RSR, so we don't directly represent totalWeights. Instead, we actually store `weights` and `hasWeights`. The effective `totalWeights` value can be computed as follows:

totalWeights(A,B) == (hasWeights[A] ? weights[A][b] : ( (A == B) ? WEIGHT_ONE : 0 )

---

Allowance crossings don't need weighted many-to-many distributions, and are thus much simpler.

## Roles

There are 3 roles in the new RSR:

- Pauser: Can pause and unpause the ERC20 + ERC2612 functions. Intended to eventually be set to the zero address but kept longer than `owner`
- Mage: Intra-tx role assigned temporarily in order to cast one-use spells. Never the sender of a tx and always the zero address at rest
- Owner: Greatest access role. Held between deployment and forktime, during which it is set to the zero address.

## Spells

A spell is a contract that implements a one-time series of commands atomically on another contract. Only the owner of RSR can cast spells.

We have two spells, currently:

- SiphonSpell: For performing a series of RSR siphons in a single tx in order to prepare weights
- ForkSpell: For completing the fork to RSR

## Lifecycle

RSR is deployed paused, in a Setup state. During this time, instances of the `SiphonSpell` can be cast as the old RSR continues to function. ERC20 + ERC2612 functions revert, and `balanceOf` reads a balance from old RSR. Once the crossing weights of RSR have been prepared sufficiently, the fork can be (nearly) completed by executing `ForkSpell`, pausing old RSR and unpausing the upgraded RSR, as well as setting the owner to zero. At some time after the fork and confirmed proper functioning of the new RSR, the pauser role should also be set to the zero address.

## ERC20 caveat: Total Supply

The total supply of new RSR is fixed at 100 billion. However, due to rounding during crossings, it is possible for the sum of all balances on new RSR to be less than this amount. The delta is on the order of a handful of quanta of RSR, and may even be 0 if there are no complicated siphons that introduce rounding.

## Security

An independent review and audit was performed by [Solidified](https://solidified.io/). The final report is located in the `audits` directory.

No contracts can be upgraded. Ownership/Pausership is set to the zero address after the fork in order to reach maximum decentralization.
