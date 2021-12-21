# Mainnet RSR
This repo contains the code for a mainnet Reserve Rights token (RSR) that upgrades from a previously deployed version of RSR, found [here](https://github.com/reserve-protocol/rsr).

TODO: ...more

## TODO: Context

## Crossing

Weights and Balance Crossings
=============================

First of all, we want the balances from oldRSR to simply *be* the balances for this
RSR. You could imagine doing that by using a straightforward copy-on-write system, as
described at https://w.wiki/4ZBL .

----

But it's not that simple; for a handful of addresses, we also need to change the
owning address, and we sometimes need to divvy the balance at an old address among
several new addresses.  To accommodate this, we set up a matrix of weights to be
consulted during the "copy" step of that copy-on-write, which we configure after we
deploy this RSR contract and before we pause-and-transition balances from the old RSR
contract.

Instead, imagine for a moment that we have a matrix totalWeights, of type
mapping(address => mapping(address => uint16)). By default, we start with

    totalWeights[old][new] == (old == new) ? WEIGHT_ONE : 0

Before transitions, every time the admin calls siphon(old, prev, to, weight), we do

    totalWeights[old][prev] -= weight;
    totalWeights[old][to]   += weight;

When we read new balances, then, for any address A, the inherited balanceOf(A) is:

    sum_{all addresses B} ( totalWeights[B][A] * oldRSR.balanceOf(B) / WEIGHT_ONE; )

----

But it's not quite that simple, either. Because gas, we don't want to initialize a
matrix with at least one nonzero values for each address that holds some RSR, so we
don't directly represent totalWeights. Instead, we actually store `weights` and
`hasWeights`. The effective `totalWeights` value can be computed as follows:

   totalWeights(A,B) == (hasWeights[A] ? weights[A][B] : ( (A == B) ? WEIGHT_ONE : 0 )

----

Allowance crossings don't need weighted many-to-many distributions, and are thus much
simpler.


## Naming

The previously deployed version of RSR is referred to in this repo as `OldRSR`. The intended target of this name is the 2019-deployed RSR found at address `0x8762db106b2c2a0bccb3a80d1ed41273552616e8` on Ethereum mainnet. This enables all `RSR` references to be to the newly upgraded 2022 RSR. 

## Roles

There are 3 roles in the new RSR:
- Pauser: Can pause and unpause the ERC20 + ERC2612 functions. Intended to eventually be set to the zero address but kept longer than `owner`
- Regent: Intra-tx role assigned temporarily in order to cast one-use spells. Never the sender of a tx. 
- Owner: Greatest access role. Intended to be set to the zero address at the time of the fork. 

## Spells

A spell is a contract that implements a one-time series of commands atomically on another contract. Only the owner of RSR can cast spells. 

We have two spells, currently:
- SiphonSpell: For performing a series of RSR siphons in a single tx. 
- ForkSpell: For completing the fork to RSR

## Nuance: Total Supply

The total supply of new RSR is fixed at 100 billion. However, due to rounding during crossings, it is possible for the sum of all balances on new RSR to be less than this amount. The delta is on the order of quanta RSR, and may even end up being 0 if there are no complicated siphons. 

