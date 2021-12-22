# Mainnet RSR
This repo contains the code for a mainnet Reserve Rights token (RSR) that upgrades from a previously deployed version of RSR, found [here](https://github.com/reserve-protocol/rsr).

## Context

We need to upgrade our old RSR contract, mostly to unlock tokens on the old RSR contract that were "locked forever" -- with the intent of staying locked until our mainnet protocol launch. Now that our mainnet protocol is on its way, we need to deploy an upgraded RSR so that it can be in use in advance of that protocol's launch.

The transfer of tokens from the old RSR contract to the new one is intended to be entirely automatic. The new RSR contract is aware of the old RSR contract, and it will simply use the old RSR’s balances as the starting balances of new RSR accounts. We do this, here, by overriding the `transfer`, `transferFrom`, and `balanceOf` functions in order to implement the [copy-on-write pattern](https://en.wikipedia.org/wiki/Copy-on-write). (Alternately, think of this as a lazy copy of all balances.)


## Weights and Balance Crossings

But this implementation is definitely not as simple as a lazy copy; for a handful of addresses, we also need to change the owning address, and we sometimes need to divvy the balance at an old address among several new addresses.  To accommodate this, we set up a matrix of weights to be consulted during the "copy" step of that copy-on-write, which we configure after we deploy this RSR contract and before we pause-and-transition balances from the old RSR contract.

Instead, imagine for a moment that we have a matrix totalWeights, of type mapping(address => mapping(address => uint16)). By default, we start with

    totalWeights[old][new] == (old == new) ? WEIGHT_ONE : 0

Before transitions, every time the admin calls siphon(old, prev, to, weight), we do

    totalWeights[old][prev] -= weight;
    totalWeights[old][to]   += weight;

When we read new balances, then, for any address A, the inherited balanceOf(A) is:

    sum_{all addresses B} ( totalWeights[B][A] * oldRSR.balanceOf(B) / WEIGHT_ONE; )

----

But it's not quite that simple, either. Because gas, we don't want to initialize a matrix with at least one nonzero values for each address that holds some RSR, so we don't directly represent totalWeights. Instead, we actually store `weights` and `hasWeights`. The effective `totalWeights` value can be computed as follows:

   totalWeights(A,B) == (hasWeights[A] ? weights[A][B] : ( (A == B) ? WEIGHT_ONE : 0 )

----

Allowance crossings don't need weighted many-to-many distributions, and are thus much simpler.


## Naming

The previously deployed version of RSR is referred to in this repo as `OldRSR`. The intended target of this name is the 2019-deployed RSR found at address `0x8762db106b2c2a0bccb3a80d1ed41273552616e8` on Ethereum mainnet. This enables all `RSR` references to be to the newly upgraded 2022 RSR. 

## Roles

There are 3 roles in the new RSR:
- Pauser: Can pause and unpause the ERC20 + ERC2612 functions. Intended to eventually be set to the zero address but kept longer than `owner`
- Mage: Intra-tx role assigned temporarily in order to cast one-use spells. Never the sender of a tx. 
- Owner: Greatest access role. Intended to be set to the zero address at the time of the fork. 

## Spells

A spell is a contract that implements a one-time series of commands atomically on another contract. Only the owner of RSR can cast spells. 

We have two spells, currently:
- SiphonSpell: For performing a series of RSR siphons in a single tx. 
- ForkSpell: For completing the fork to RSR

## Nuance: Total Supply

The total supply of new RSR is fixed at 100 billion. However, due to rounding during crossings, it is possible for the sum of all balances on new RSR to be less than this amount. The delta is on the order of a handful of quanta of RSR, and may even be 0 if there are no complicated siphons.

