import { bn } from '../../common/numbers'
import { BigNumberish } from 'ethers'

type Siphon = {
  from: string
  to: string
  weight: BigNumberish
}

const SOME_ADDR = '0x0000000000000000000000000000000000000003'

// Upgrade siphons

export const UPGRADE_SIPHONS: Siphon[] = [
  { from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x082705fabf49bd30de8f0222821f6d940713b89d', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xc3aa4ced5dea58a3d1ca76e507515c79ca1e4436', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x66f25f036eb4463d8a45c6594a325f9e89baa6db', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x9e454fe7d8e087fcac4ec8c40562de781004477e', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x4fcc7ca22680aed155f981eeb13089383d624aa9', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x5a66650e5345d76eb8136ea1490cbcce1c08072e', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x698a10b5d0972bffea306ba5950bd74d2af3c7ca', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xdf437625216cca3d7148e18d09f4aab0d47c763b', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x24b4a6847ccb32972de40170c02fda121ddc6a30', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x8d29a24f91df381feb4ee7f05405d3fb888c643e', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x5a7350d95b9e644dcab4bc642707f43a361bf628', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xfc2e9a5cd1bb9b3953ffa7e6ddf0c0447eb95f11', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x3ac7a6c3a2ff08613b611485f795d07e785cbb95', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x47fc47cbcc5217740905e16c4c953b2f247369d2', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xd282337950ac6e936d0f0ebaaff1ffc3de79f3d5', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xde59cd3aa43a2bf863723662b31906660c7d12b6', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x5f84660cabb98f7b7764cd1ae2553442da91984e', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xefbaaf73fc22f70785515c1e2be3d5ba2fb8e9b0', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x63c5ffb388d83477a15eb940cfa23991ca0b30f0', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x14f018cce044f9d3fb1e1644db6f2fab70f6e3cb', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xbe30069d27a250f90c2ee5507bcaca5f868265f7', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xcfef27288bedcd587a1ed6e86a996c8c5b01d7c1', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x5f57bbccc7ffa4c46864b5ed999a271bc36bb0ce', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xbae85de9858375706dde5907c8c9c6ee22b19212', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x5cf4bbb0ff093f3c725abec32fba8f34e4e98af1', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xcb2d434bf72d3cd43d0c368493971183640ffe99', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x02fc8e99401b970c265480140721b28bb3af85ab', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xe7ad11517d7254f6a0758cee932bffa328002dd0', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x6b39195c164d693d3b6518b70d99877d4f7c87ef', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xc59119d8e4d129890036a108aed9d9fe94db1ba9', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xd28661e4c75d177d9c1f3c8b821902c1abd103a6', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xba385610025b1ea8091ae3e4a2e98913e2691ff7', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0xcd74834b8f3f71d2e82c6240ae0291c563785356', to: SOME_ADDR, weight: bn('0.5e18') },
  { from: '0x657a127639b9e0ccccfbe795a8e394d5ca158526', to: SOME_ADDR, weight: bn('0.5e18') },
]
