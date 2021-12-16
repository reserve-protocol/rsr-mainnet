# What is This?
The purpose of this file is to record our notes on external accounts that hold RSR, and lay out our plans for handling them.

This Markdown file lists every Ethereum address that:
- owns 1000 or more RSR
- showed up on Etherscan as a contract (not _all_ with known, verified sources)

I first binned these contracts by name; most deployed contract instances were simply named "Proxy". Each of the following headings, then, is a unique contract _name_ holding some RSR. There certainly are contract-name collisions (e.g, ReserveRightsToken catches both our current RSR and a *really* old RSR deployment, for instance), but surprisingly few, and usually they're very related.

# Our Contracts
## SlowWallet
- 49,448,001,323 RSR
- That's us. Think carefully, but we expect we can just move funds out and into a different slow wallet.
- [ ] What's the plan, _exactly_?

## MultiSigWalletWithDailyLimit
- 19,076,398,139 RSR
- Also us, and this seems simpler.
- [ ] What's the plan, exactly?

## ReserveRightsToken
- 3,814,818 RSR
- 0x8762db106b2c2a0bccb3a80d1ed41273552616e8
0x0c226d8dae08cf021f2f03afc2eff5c9c0b24671

This is us, and we resolve these tokens just by sweeping the address.

Remember to sweep the even-older address, too!

## Reserve
- 91,378 RSR
- 0x1dcac83e90775b5f4bc2ffac5a5749e25acc610d

Uh. This is RSV, and I *know* it couldn't ever do anything with these tokens.

We _could_ sweep them from here, and do ... something intelligent with them? It's about $2000.
## TokenVesting
- 53,923 RSR
- 0x04ba2992bbad61fb7d125a4daf69ce8c1409e14c

This is *our* token vesting contract. Surprised we've got one in the wild with such little funds in it...

- [ ] Plan! We might even need to redeploy this one and redirect its tokens


## Manager
- 1,386 RSR
- 0x5ba9d812f5533f7cf2854963f7a9d212f8f28673

- [ ] Sweep from here; this is our own RSV Manager. -_-

# Bridge Contracts
## Wormhole
- 711,084 RSR
- 0xf92cd566ea4864356c5491c177a430c222d7e678

Generic bridge, owns many tokens.

This is a Solana bridge.

- https://v1.wormholebridge.com/#/help
- https://github.com/solana-labs/oyster

- [ ] Reach out to bridge operators

## EternalStorageProxy
- 435,801 RSR
- 0x88ad09518695c6c3712ac10a214be5109a655671

Owns many tokens. Seems to be a proxy for a generic bridge contract to the POA network. (the xDai network?)

- [ ] Reach out to bridge operators

## ERC20PredicateProxy
- 370,955 RSR
- 0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf

Owns many tokens. Seems to be a Polygon bridge contract.

- [ ] Reach out to bridge operators

# Contracts Needing Action:

These contracts will (or are likely to) break unless some sort of
action is taken, probably ahead of time.

For many of these contracts, I think there's no option except getting
the people controlling value in them to back out their deposits before
we freeze oldRSR.
## StandardPoolConverter
- 23,938,026 RSR
- 0x4a0737d8a87c9ffc31adf85d578339d5c7a5270d

Controls only Bancor (BNT) and RSR.

Might be a problem.

- [ ] Plan.

## UniswapV2Pair
- 17,418,723 RSR
- We already know this is a problem.

- [ ] Plan.

## CErc20Immutable
- 1,415,829 RSR
- 0xa0998fc7dcf51169d97a74f0b0b7d97e4af8e873

The RSR CToken.

- [ ] Plan

## BPool
- 295,435 RSR
- 0x57f604e1be07f2db3e19b58ea00d0005156889d2
- 0x371a47394006224e38c9da28c17738e4f9a7900e
- 0x838d504010d83a343db2462256180ca311d29d90
- 0x918b5d94ec11f889ef5a1fe7df799ddfc3397776

Balancer pools.

Balancer pools contain a direct reference to token addresses as state. It looks like the token address they point to is configurable in-flight. We'll need to reach out to people to keep their pools spinning.

- [ ] Plan

## Curve Gauge Contract for RSR
(The "contract name" that etherscan knows is just "Vyper_contract")

- 142,054 RSR
- 0x4dc4a289a8e33600d8bd4cf5f6313e43a37adec7

- [ ] Plan. It looks like the Guage contract can't be directly updated, but an admin can "kill" it?

## VirtualBalanceRewardPool
- 43,182 RSR
- 0x94c259dc4c6df248b0b5d23c055cb7574a587d67

This is the Synthetix wrapper for RSR. 

- [ ] Looks like there's no way to update the underlying address, even though this contract has an "operator"


## CurveRewards
- 13,356 RSR
- 0xad4768f408dd170e62e074188d81a29ae31b8fd8

- [ ] Plan. (Oh no, the RSR contract address is _hardcoded_ in this contract. It'll have to be wound down!)
## Uniswap V1 proxy? (a vyper contract)
- 2,000-ish RSR
- 0xeeeec06f48656e921b39e30d9a205cb2b08ea465

Proxy for 0x2157a7894439191e520825fe9399ab8655e0f708
- [ ] Plan? From a quick look, it's really hard to tell if this RSR isn't just already stuck. I think they are.

## SetToken
- 31,355 RSR
- 0x64ddf354fd42935e0286425001aac7d3c3995d6d
- 0x66903f7b0f8499fea922ce40cf359754d7f47c73

I think both of these are adminable, but it looks actually pretty
complicated to do. In each case, I think the set is only held by a
single address, and they could just back out of the position and open
a new one.

### 0x64dd...5d6d

_component[1] == {RSR address}.

### 0x6690...7c73

_component[2] == {RSR address}.

## ARTHRSRPool
- 14,144 RSR
- 0x9ba1ac9bf8bb002bc36966f6135a4c27c9ba08bf

Token interactions here are *not* generic. This is now hard-set to be some sort of Synthetix pool between RSR and another token, and the underlying RSR address cannot be changed.

# No Action Needed: Should Just Work

## Proxy
67,278,492 RSR

There are *many* of these contracts deployed (282), and in fact, there are six different contracts named "Proxy".

Among our holders, each implementation is always initialized with the same constructor data, which suggests that all of these really are just implementations of a handful of underlying contracts. The contracts are:

### Gnosis Safe
(e.g, 0xa7b123d54bcec14b4206dab796982a6d5aaa6770)
Wallets allow variable token addresses; this should be fine.

- [ ] Verify no action needed

### Argent BaseWallet
All others are proxies for Argent BaseWallet contracts. Wallets allow variable token addresses; this should be fine.

- [ ] Verify no action needed

## Bridge
- 48,751,200 RSR
- 0xa929022c9107643515f5c777ce9a910f0d1e490c

Uses variable token addresses. I think it should be fine, so long as bridges are generally fine.

- [ ] Verify no action needed


## DelegateCallProxyManyToOne
- 35,517,733 RSR
- 0x126c121f99e1e211df2e5f8de2d96fa36647c855

DEGEN token. Fund indexer. Controls many tokens, must allow variable token addresses.

- [ ] Verify no action needed

## Exchange
- 7,690,660 RSR
- 0x2a0c0DBEcC7E4D658f48E01e3fA353F44050c208

IDEX.

Contract owns > 100 tokens and is managed by an owner. Must be generic?

- [ ] Verify no action needed

## SplTokenSwap
- 3,695,824 RSR
- 0xeae57ce9cc1984f202e15e038b964bb8bdf7229a

Controls many tokens. All transactions accept generic erc20 tokens. The upgrade should Just Work for *this* contract...

But it's also part of a token bridge 

- [ ] Verify no action needed

## TokenBridge
- 3,010,330 RSR
- 0x3ee18b2214aff97000d974cf647e7c347e8fa585

Controls many tokens. Is generic. Is Bridge to some other chain.

- [ ] Verify no action needed

## UpgradeBeaconProxyV1
- 1,036,222 RSR
- 
49 addresses; for instance: 0xb8887fd5e6f505fc63588a8e31041fadacfb9699

All 49 have the same contract source and constructor arguments. All delegate to the BeaconProxy at 
0x000000000026750c571ce882B17016557279ADaa

This is a smart wallet; it's almost certainly token-generic, and owns RSR without any hard-wired stuff.

- [ ] Verify no action needed

## Custodian
- 489,797 RSR
- 0xe5c405c5578d84c5231d3a9a29ef4374423fa0c2
 
Owns many tokens, uses token-generic transactions. Looks like some sort of exchange wallet?

- [ ] Verify no action needed

## UserWallet
- 259,845 RSR
- 0xda59605923324fe56bf990467f940fe8473a2577
- 0xffdc748ffb88dfa220b98f34216cfd42c8b69235
- 0xec68fe4bedcbdd179bc61704a83cd6a26c720627

Specific user wallets, for Bittrex I think. Generic across ERC-20s.

No action needed

## GnosisSafeProxy
- 154,655 RSR
- 0x13d91d079129b94f37ac92185f7656d75774ce33
- 0x68b43fcd1ccdc7ae0405a706764c3aaba7be042e

It's a Gnosis Safe Proxy. Yep.

No action needed.


## BrokerV2
- 132,718 RSR
- 0x7ee7ca6e75de79e618e88bdf80d0b1db136b22d0

Broker for the Switcheo Exchange.

Is token-generic, and already controls many tokens

No action needed.

## DharmaTradeReserve
- 127,822 RSR
- 0x0efb068354c10c070ddd64a0e8eaf8f054df7e26

Controls many tokens; is a proxy for a dex-like setup that does not hardcode its token addresses.

No action needed.

## FeeDistributor
- 102,301 RSR
- 0xc4d57904c4435a9348b56051e4dea6055d85a6a9
- 0xae99862cb922cf20f341f4292af82cf673df0db6

No action needed; tokens handled generically.

## GPv2Settlement
- 84,267 RSR
- 0x9008d19f58aabd9ed0d60971565aa8510560ab41

Gnosis Protocol v2 Settlement

Controls many tokens; I assume it can handle them generically.

No action needed.

## UniBrightToken
- 58,437 RSR
- 0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e

I suspect this is some mechanism that does generic token handling, but it's really not obvious.

- [ ] I _think_ no action is needed here, but someone else should maybe double-check on that.

## TransparentUpgradeableProxy
- 44,907 RSR
- 0x43d037a562099a4c2c95b1e2120cc43054450629

This instance is a proxy for something handling tokens generically.

No action needed.

## DSProxy
- 35,800 RSR
- 0xa90f8f0702319f8f3ff140bd43720459983a3c92

This is basically being used as a token wallet, owned by an active external account.

## EtherDelta
- 31,960 RSR
- 0x8d12a197cb00d4747a1fe03395095ce2a5cc6819

No action needed; this is a DEX contract handling tokens generically.

## Crucible
- 17,827 RSR
- 0x1e2536dff1fa2284b6c992c4e5c56de418e04e54

- I think this is fine -- looks generic and adminable. Check more closely, though.

## DefaultDepositContract
- 12,003 RSR
- 0x674bdf20a0f284d710bc40872100128e2d66bd3f

No action needed. Smart wallet handling generic tokens.

## CloneableWallet
- 7,777 RSR
- 0xb326ebf2c5a0493c228dde70bc302e7abbd95688

No action needed. Generic smart wallet. 

## GovernanceLeftoverExchanger
- 7,345 RSR
- 0xdd9f24efc84d93deef3c8745c837ab63e80abd27

No action needed. Generic token handler.


## UpgradeabilityProxy
- 4,683 RSR
- 0xa9e238d3692b71c781320d3bccc2730ff67697c2

No action. Generic wallet

## ERC20WrapperV1
- 2,935 RSR
- 0xc4681b7f5206603715998dabac4fa87c586ad63d

No action; generic token handler.

## TokenHolder
- 1,766 RSR
- 0xebcc959479634eec5a4d7162e36f8b8cc763f491

No action needed; handles tokens generically.

## AccountProxy
- 1,411 RSR
- 0x12ed1035a37650f65c69fe493d93272eb123d1f9

No action needed; this is a generic smart wallet.


# No Action Needed: RSR Balance is Already Dead

## TokenMintERC20Token
- 231,662 RSR
- 0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce

Has many different tokens?

Also, I think this is *just* the Shiba Inu token, and I'm pretty sure it can't do anything with any of these tokens anyway. ??!?

- [x] Actually, I'm pretty confused about this? Why is there this much of a balance here? Double-check that these tokens really are just lost.


## FyoozCoin
- 100,026 RSR
- 0x6bff2fe249601ed0db3a87424a2e923118bb0312

Just a token; RSR is only here in error.
## DINGER
- 74,134 RSR
- 0x9e5bd9d9fad182ff0a93ba8085b664bcab00fa68

OK, this is nontrivial, but any RSR here is just stuck.


## OraiToken
- 32,815 RSR
- 0x4c11249814f11b9346808179cf06e71ac328c1b5

Dead balance, no action needed.


## lcxToken
- 5,000 RSR
- 0x037a54aab062628c9bbae1fdb1583c195585fe41

No action needed; these tokens are already stuck.

## Telcoin
- 2,749 RSR
- 0x467bccd9d29f223bce8043b84e8c8b282827790f

No action; these tokens are already stuck.


## BZRXToken
- 2,400 RSR
- 0x56d811088235f11c8920698a204a5010a788f4b3

No action; these tokens are already stuck.

## RepublicToken
- 1,488 RSR
- 0x408e41876cccdc0f92210600ef50372656052a38

No action needed; the RSR here is stuck.


## ZapToken
- 1,000 RSR
- 0x6781a0f84c7e9e846dcb84a9a5bd49333067b104

No action needed; the RSR here is stuck.

## Hakka
- 1,000 RSR
- 0x0e29e5abbb5fd88e28b2d355774e73bd47de3bcd

No action needed; the RSR here is stuck.
