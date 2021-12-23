
# Names 

## Keys

- **OldPauser**, a well-protected but difficult-to-access cold key, already in use.
- **CompanySafe**, our company multisig; a Gnosis Safe.
- **Burner**, a stand-in name for hot Ethereum keys generated when needed, and discarded after. Each instance of Burner may be different, and no instance is expected to be particularly secure or available later.

## Times

- **Fork Time**, the moment when we place to retire old RSR and bring new RSR into operation. This should be communicated well in advance, and very possibly negotiatied among a handful of interested parties. (This is really Fork Datetime or something, but that's an awful name outside a programming context.)

- **Last Call**, the last moment when we're willing to accept any further requests, internally or externally, to set up token siphons from old RSR addresses. Probably, this is the start of the day, two days before Fork Time; this time might also be further negotiated.

# Phases of Deployment
### Phase 1
**When?** The first convenient time after our contracts are back from audit, and we've acted on all issues they've suggested.

1. As a Burner, run a Hardhat script (`1_deploy_rsr_fork_spell.ts`) to:
    1. Deploy RSR 
    2. Call RSR.changePauser(CompanySafe)
    3. Call RSR.transferOwnership(CompanySafe)
    4. Deploy ForkSpell

2. Via a Hardhat script (`2_verify_contracts.ts`), verify the RSR and ForkSpell contracts on Etherscan.

3. Check on Etherscan to ensure that:
    * The new RSR and new ForkSpell have the addresses we expect (and record them here!)
    * RSR.oldRSR() is oldRSR
    * RSR.totalSupply() is 100,000,000,000
    * RSR.owner() is CompanySafe
    * RSR.phase() is 0 (SETUP)
    * RSR.pauser() is CompanySafe
    * RSR.balanceOf(A) = oldRSR.balanceOf(A), for at least one address A with nonzero balances.
    * Confirm ForkSpell.rsrAddr() is RSR address

### Phase 2
**When?**  The earliest convenient time to use OldPauser after Phase 1.

1. As OldPauser, via Etherscan, call:
    * OldRSR.addPauser(ForkSpell).
    * OldRSR.addPauser(CompanySafe).

2. Check on Etherscan to ensure that:
    * oldRSR.isPauser(ForkSpell) is true
    * oldRSR.paused() is false

    
### Phase 3
- **When?** Just after Last Call.

1. As a Burner, via a Hardhat script (`3_deploy_siphon_spell.ts`), deploy the most up-to-date SiphonSpell.

2. Via a Hardhat script (`4_verify_siphon_contract.ts`), verify the SiphonSpell on Etherscan.

3. Check on Etherscan to ensure that:
    * SiphonSpell.siphons(x) is what we expect, for at least the values 0, 1, 7, N-1, N, where N is the total number of siphons we intended to initialize the spell with.
    * Confirm SiphonSpell.rsr() is RSR address

4. As CompanySafe, via the Gnosis Safe interface, cast the SiphonSpell.
    * (Remember that CompanySafe transactions require multiple signers!)

5. Check on Etherscan to ensure that: 
    * For at least three address pairs (A, B) in our siphon plans:
        * RSR.weights(A,A) is as intended
        * RSR.weights(A,B) is as intended
        * RSR.hasWeights(A) is true
        * RSR.balCrossed(A) is false
        * RSR.balanceOf(B) is what we expect from all current RSR balances leading to it.
    * For at least three addresses A that have nonzero balances and are _not_ in our siphon plans:
        * RSR.hasWeights(A) is false
        * RSR.balCrossed(A) is false
        * RSR.balanceOf(A) == oldRSR.balanceOf(A)
        * RSR.weights(A,A) = 0
    * RSR.hasWeights(0) is false
    * RSR.hasWeights(1) is false

### Phase 4
- **When?** Fork Time.

1. As CompanySafe, via the Gnosis Safe interface, cast the ForkSpell.
    * All but one needed keyholder should do execute their confirmations just _before_ the specified Fork Time.
    * The confirming keyholder should perform their transaction just _after_ the specified Fork Time.

2. Check on Etherscan to ensure that:
    * RSR.paused() is false
    * RSR.mage() is 0
    * RSR.owner() is 0
    * RSR.phase() is 1 (WORKING)
    * RSR.pauser() is CompanySafe
    * oldRSR.paused() is true
    * The balance checks from Phase 3 all work, as long as the addresses have not been crossed since fork

3. Perform a void self-transfer for an address with balance

# Long-lived State

## Mainnet Addresses 

Add tbd entries as we learn them


| Name of acct or contract | Address                                    |
| --                       | ----                                       |
| CompanySafe              | 0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770 |
| OldPauser                | 0xBb20467EcccB3F60F8dbEca09a61879893e44069 |
|                          |                                            |
| Old RSR                  | 0x8762db106b2c2a0bccb3a80d1ed41273552616e8 |
|                          |                                            |
| (New) RSR                | tbd                                        |
| ForkSpell                | tbd                                        |
| SiphonSpell              | tbd                                        |



    
