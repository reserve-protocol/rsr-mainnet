


TODO: Iterate through this plan, and specify with clarity the specific conditions that should be verified at each point.

# Names 

## Keys

- **OldPauser**, a well-protected but difficult-to-access cold key, already in use.
- **CompanySafe**, our company multisig; a Gnosis Safe.
- **Alice**, an operational hot key derived from a hardware wallet.

Alice is not already in use anywhere else, and Alice is not meant to hold any special permissions afterwards.

## Times

- **Upgrade Time**, the moment when we place to retire old RSR and bring new RSR into operation. This should be communicated well in advance, and very possibly negotiatied among a handful of interested parties.

- **Last Call**, the last moment when we're willing to accept any further requests, internally or externally, to set up token siphons from old RSR addresses. Probably, this is the start of the day, two days before Upgrade Time; this time might also be further negotiated.

# Phases of Deployment
### Phase 1
**When?** The first convenient time after our contracts are back from audit, and we've acted on all issues they've suggested.

1. As Alice, Deploy RSR. Verify:
   * -
   * - 
   * -
    
2. As Alice, Deploy UpgradeSpell. Verify:
   * -
   * -
   * - 
3. As Alice, Call RSR.addPauser(CompanySafe) and then RSR.renouncePauser(). Verify:
   * -
   * -
   * -
    
### Phase 2
**When?**  The earliest convenient time to use Malcolm after Phase 1.

1. As OldPauser, via Etherscan, call OldRSR.addPauser(UpgradeSpell). Verify that:
   * -
   * - 
   * -
    
### Phase 3
- **When?** Shortly after Last Call.

1. As Alice, deploy up-to-date SiphonSpell. Verify:
   * - 
   * - 
   * - 
2. Re-verify the correctness of the current deployment:
3. As CompanySafe, cast that SiphonSpell. Verify:
   * - ... correct resulting weights
   * - 
   * - 

### Phase 4
- **When?** Upgrade Time.

1. In the hour before Upgrade Time, company safe keyholders prepare all but the execution confirmation needed to cast the UpgradeSpell.

2. _At_ Upgrade Time, as CompanySafe, cast the UpgradeSpell. Verify:
   * -
   * -
   * -

# Long-lived State

## Mainnet Addresses 

Add tbd entries as we learn them

| Name of acct or contract | Address                                    |
|                          |                                            |
| CompanySafe              | 0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770 |
| OldPauser                | 0xBb20467EcccB3F60F8dbEca09a61879893e44069 |
| Alice                    | tbd                                        |
|                          |                                            |
| Old RSR                  | 0x8762db106b2c2a0bccb3a80d1ed41273552616e8 |
|                          |                                            |
| (New) RSR                | tbd                                        |
| UpgradeSpell             | tbd                                        |
| SiphonSpell              | tbd                                        |



    
