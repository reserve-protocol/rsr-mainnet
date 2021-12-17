# Deployment Plan

let keys = Malcolm, key1

## Step 1
From key1:
- Deploy RSR
- Verify on Etherscan

From anykey(key1):
- Deploy SiphonSpell
- Deploy UpgradeSpell
- Verify Contracts on Etherscan

## Step 2
Using Malcolm connected to the blockchain via Etherscan/something more casual:
- Add UpgradeSpell as pauser of OldRSR

## Step 3 (optional)
From anykey(key1):
- Deploy updated SiphonSpell
- Verify Contracts on Etherscan

## Step 4
- Confirm all deployed spells appear correct on the blockchain, manually

## Step 5
From key1:
- Cast latest deployed SiphonSpell

## Step 6
- Confirm SiphonSpell cast results in correct RSR weights

## Step 7
From key1:
- Cast UpgradeSpell

# Long-lived State, maybe stored in local JSON file?

## Addresses
Network config:
- OldRSR

Gitignored .json file, split by chainId
- SiphonSpell (Latest deployed)
- UpgradeSpell
- RSR
