# What is This?
The purpose of this file is to record our notes on external accounts that hold RSR, and lay out our plans for handling them.

This Markdown file lists every Ethereum address that:
- owns 1000 or more RSR
- had contract source known to Etherscan

I first binned these contracts by name; most deployed contract instances were simply named "Proxy".

Each of the following headings, then, is a unique contract _name_ holding some RSR. There certainly are contract-name collisions (e.g, ReserveRightsToken catches both our current RSR and a *really* old RSR deployment, for instance), but surprisingly few, and usually they're very related.



# What we'll do with various contracts


## SlowWallet
49,448,001,323 RSR
That's us. Think carefully, but we expect we can just move funds out and into a different slow wallet.

- [ ] What's the plan, _exactly_?
## MultiSigWalletWithDailyLimit
19,076,398,139 RSR
Also us, and this seems simpler.

- [ ] What's the plan, exactly?

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

- [ ] Verify no change needed

## Bridge
48,751,200 RSR
0xa929022c9107643515f5c777ce9a910f0d1e490c

Uses variable token addresses; should be fine.

- [ ] Verify no change needed


## DelegateCallProxyManyToOne
35,517,733 RSR
0x126c121f99e1e211df2e5f8de2d96fa36647c855

DEGEN token. Fund indexer. Controls many tokens, must allow variable token addresses.

- [ ] Verify no change needed

## StandardPoolConverter
23,938,026 RSR
0x4a0737d8a87c9ffc31adf85d578339d5c7a5270d

Controls only Bancor (BNT) and RSR.

Might be a problem.

- [ ] Plan.

## UniswapV2Pair
17,418,723 RSR
We already know this is a problem.

- [ ] Plan.

## Exchange
7,690,660 RSR
0x2a0c0DBEcC7E4D658f48E01e3fA353F44050c208

IDEX.

Contract owns > 100 tokens and is managed by an owner. Must be generic?

- [ ] Verify

## ReserveRightsToken
3,814,818 RSR
0x8762db106b2c2a0bccb3a80d1ed41273552616e8
0x0c226d8dae08cf021f2f03afc2eff5c9c0b24671

This is us, and we resolve these tokens just by sweeping the address.

Remember to sweep the even-older address, too!

## SplTokenSwap
3,695,824 RSR
0xeae57ce9cc1984f202e15e038b964bb8bdf7229a

- [ ] From here, no one has scouted the contracts yet...

## TokenBridge
3,010,330 RSR
0x3ee18b2214aff97000d974cf647e7c347e8fa585

## CErc20Immutable
1,415,829 RSR
0xa0998fc7dcf51169d97a74f0b0b7d97e4af8e873

## UpgradeBeaconProxyV1
1,036,222 RSR

49 addresses:

0xb8887fd5e6f505fc63588a8e31041fadacfb9699
0x662491db0cd0b9a48c79ecdf61dca2357007f875
0xad325a9a1a55110c8bf50fe2742db851b41eef1f
0x54de761331fd6ad390d821ab0a29202869eefd0c
0x1e62a05c16c09503ee6f89d7c5c622d7cbf2f4ff
0x5a8c3e9c7d6e5552dfaf0c6ee839d6989dbdd234
0x8710dd213cdcbf92bf0eb3670ac2f91d2f9c4610
0x97f4bc0ea8de630f7f06a82dee20a2acb2bb746e
0x132cd54b4bca8bba5458e47466733eeab8da64d5
0xfad327f0aff00adc6ddd0da932f66dd7c733400f
0x81ac862adf3d412f0d69f58fe9439efc77c50632
0xb2f33e9d8dc475acdb9c7e428f03960e7786a3fe
0x6c08e63f7f513515f5b972dfeb3df1590409b509
0x061911bad13421d157b175f593699bcc25d37fc1
0x3e9d32c866263d8cb7259112f2043169cd5d07a8
0x985585f4fa842d4a9caf420b488306ba6f69e2f8
0x6a029cd3371780b5726b74ee58d5fe8933e3705d
0x62f2462248d6eb9321840cb94835973815a1fb06
0x151bab731c6bc5dc73379fd2291d343ac5bb8bd5
0x9e7e9d15c8a3125dc58baaa2e4c615d82a18a3f4
0x168ce3311729e1d340f89b054b966d51abf86353
0xa6be0527604e1b9c48273342d6ca5f6d799822dc
0x35674423f18ccfe2653d8cdfddfccefee06e3743
0xaba8b4b15d21d292097b3ee03efd08ca7e7c5b10
0x0d15258567942c0f9b7cfef596fbd2fb825593d2
0x093bf66e2fb6ac1092fdfc701036bf2a095efbce
0xe48c13caa0c625bc587b99523fbe9665ac105828
0x96c5ea141bb2889ccf0faa5cdb1ac3a5b04d2544
0x5dc31955965fb2ab60a467400321fb9e2fc70a2e
0x0820a4863ac6dd4340b3bed017b2372199e6e64e
0x5cb7f293deb216e7de09ccd9247ddf2610fe5b0a
0xe9c598bfb0b76fef32c0d592de00adf785874888
0x62b272b0775da96839ca358243e18430fa3c4e1d
0x2ffd948516e142d9c112f3b3fdf9c444ffdae6c5
0x9a108da797193252f21baa3b33598c1efa52c940
0xaa127010d43d554be6c990be0563667ed2621b0e
0x7cd8bba020a45a059137de25a4715e29b5f9c4fc
0x03640e5da4b01455f79bc85cfec37a5e94b1b678
0xc95a756a9eed759f7fa8843af93d329e6f28a9bc
0x3cd573b89526dbaefbdf4cf2443c2411aa0cae8e
0x560d2bd4e3763713618e408173144a01c63628af
0x2636287ab37dbd6ba7cad7e7a1a805b86f58f0e7
0xecd02551fb6d49970af6c1d0e36205517fd4aa9e
0x33c1643fb61930129b990631052bca06bffec251
0x250215b78333bb43bee1dbb3430d54e3e88b6765
0x2201669d56ff3b41dd60e5674a9e3987e9cd2f1a
0xd45efa3ee9eb1122da17eff709cf2fe4d19476f8
0xd593abc7b7c54afd33a87e281fc4140386b9f88d
0xae8fdcd354cd9a65ce47031a27a54364f357598f

## Wormhole
711,084 RSR
0xf92cd566ea4864356c5491c177a430c222d7e678

## Custodian
489,797 RSR
0xe5c405c5578d84c5231d3a9a29ef4374423fa0c2

## EternalStorageProxy
435,801 RSR
0x88ad09518695c6c3712ac10a214be5109a655671

## ERC20PredicateProxy
370,955 RSR
0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf

## BPool
295,435 RSR
0x57f604e1be07f2db3e19b58ea00d0005156889d2
0x371a47394006224e38c9da28c17738e4f9a7900e
0x838d504010d83a343db2462256180ca311d29d90
0x918b5d94ec11f889ef5a1fe7df799ddfc3397776

## UserWallet
259,845 RSR
0xda59605923324fe56bf990467f940fe8473a2577
0xffdc748ffb88dfa220b98f34216cfd42c8b69235
0xec68fe4bedcbdd179bc61704a83cd6a26c720627

## TokenMintERC20Token
231,662 RSR
0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce

## GnosisSafeProxy
154,655 RSR
0x13d91d079129b94f37ac92185f7656d75774ce33
0x68b43fcd1ccdc7ae0405a706764c3aaba7be042e

## Vyper
144,079 RSR
0x4dc4a289a8e33600d8bd4cf5f6313e43a37adec7
0xeeeec06f48656e921b39e30d9a205cb2b08ea465

## BrokerV2
132,718 RSR
0x7ee7ca6e75de79e618e88bdf80d0b1db136b22d0

## DharmaTradeReserve
127,822 RSR
0x0efb068354c10c070ddd64a0e8eaf8f054df7e26

## FeeDistributor
102,301 RSR
0xc4d57904c4435a9348b56051e4dea6055d85a6a9
0xae99862cb922cf20f341f4292af82cf673df0db6

## FyoozCoin
100,026 RSR
0x6bff2fe249601ed0db3a87424a2e923118bb0312

## Reserve
91,378 RSR
0x1dcac83e90775b5f4bc2ffac5a5749e25acc610d

## GPv2Settlement
84,267 RSR
0x9008d19f58aabd9ed0d60971565aa8510560ab41

## DINGER
74,134 RSR
0x9e5bd9d9fad182ff0a93ba8085b664bcab00fa68

## UniBrightToken
58,437 RSR
0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e

## TokenVesting
53,923 RSR
0x04ba2992bbad61fb7d125a4daf69ce8c1409e14c

## TransparentUpgradeableProxy
44,907 RSR
0x43d037a562099a4c2c95b1e2120cc43054450629

## VirtualBalanceRewardPool
43,182 RSR
0x94c259dc4c6df248b0b5d23c055cb7574a587d67

## DSProxy
35,800 RSR
0xa90f8f0702319f8f3ff140bd43720459983a3c92

## OraiToken
32,815 RSR
0x4c11249814f11b9346808179cf06e71ac328c1b5

## EtherDelta
31,960 RSR
0x8d12a197cb00d4747a1fe03395095ce2a5cc6819

## SetToken
31,355 RSR
0x64ddf354fd42935e0286425001aac7d3c3995d6d
0x66903f7b0f8499fea922ce40cf359754d7f47c73

## Crucible
17,827 RSR
0x1e2536dff1fa2284b6c992c4e5c56de418e04e54

## ARTHRSRPool
14,144 RSR
0x9ba1ac9bf8bb002bc36966f6135a4c27c9ba08bf

## CurveRewards
13,356 RSR
0xad4768f408dd170e62e074188d81a29ae31b8fd8

## DefaultDepositContract
12,003 RSR
0x674bdf20a0f284d710bc40872100128e2d66bd3f

## CloneableWallet
7,777 RSR
0xb326ebf2c5a0493c228dde70bc302e7abbd95688

## GovernanceLeftoverExchanger
7,345 RSR
0xdd9f24efc84d93deef3c8745c837ab63e80abd27

## lcxToken
5,000 RSR
0x037a54aab062628c9bbae1fdb1583c195585fe41

## UpgradeabilityProxy
4,683 RSR
0xa9e238d3692b71c781320d3bccc2730ff67697c2

## ERC20WrapperV1
2,935 RSR
0xc4681b7f5206603715998dabac4fa87c586ad63d

## Telcoin
2,749 RSR
0x467bccd9d29f223bce8043b84e8c8b282827790f

## BZRXToken
2,400 RSR
0x56d811088235f11c8920698a204a5010a788f4b3

## TokenHolder
1,766 RSR
0xebcc959479634eec5a4d7162e36f8b8cc763f491

## RepublicToken
1,488 RSR
0x408e41876cccdc0f92210600ef50372656052a38

## AccountProxy
1,411 RSR
0x12ed1035a37650f65c69fe493d93272eb123d1f9

## Manager
1,386 RSR
0x5ba9d812f5533f7cf2854963f7a9d212f8f28673

## ZapToken
1,000 RSR
0x6781a0f84c7e9e846dcb84a9a5bd49333067b104

## Hakka
1,000 RSR
0x0e29e5abbb5fd88e28b2d355774e73bd47de3bcd


