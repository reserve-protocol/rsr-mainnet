import { BigNumberish } from 'ethers'

import { bn } from '../common/numbers'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const WEIGHT_ONE = bn('1e18')

export interface Siphon {
  from: string
  to: string
  weight: BigNumberish
}
