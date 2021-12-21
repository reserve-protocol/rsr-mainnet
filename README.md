# Mainnet RSR
This repo contains the code for a mainnet Reserve Rights token (RSR) that upgrades from a previously deployed version of RSR, found [here](https://github.com/reserve-protocol/rsr).

## Naming

The previously deployed version of RSR is referred to in this repo as `OldRSR`. The intended target of this name is the 2019-deployed RSR found at address `0x8762db106b2c2a0bccb3a80d1ed41273552616e8` on Ethereum mainnet. This enables all `RSR` references to be to the newly upgraded 2022 RSR. 

## Spells

A spell is a contract that implements a one-time series of commands atomically on another contract. Only the owner of RSR can cast spells. 

We have two spells, currently:
- SiphonSpell: For performing a series of RSR siphons in a single tx. 
- UpgradeSpell: For completing the upgrade to RSR

## Nuance: Total Supply

The total supply of new RSR is fixed at 100 billion. However, due to rounding during crossings, it is possible for the sum of all balances on new RSR to be less than this amount. The delta is on the order of quanta RSR, and may even end up being 0 if there are no complicated siphons. 


## TODO 

Relatively incomplete instructions for developers to setup, configuration, and use the tools in this repository.
