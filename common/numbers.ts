/* eslint-disable node/no-unsupported-features/es-syntax */
import { BigNumber, BigNumberish } from 'ethers'

export const SCALE_DECIMALS = 18

// Convenience form for "BigNumber.from" that also accepts scientific notation
export const bn = (x: BigNumberish): BigNumber => {
  if (typeof x === 'string') return _parseScientific(x)
  return BigNumber.from(x)
}

export const pow10 = (exponent: BigNumberish): BigNumber => {
  return BigNumber.from(10).pow(exponent)
}

// _parseScientific(s, scale) returns a BigNumber with value (s * 10**scale),
// where s is a string in decimal or scientific notation,
// and scale is a BigNumberish indicating a number of additional zeroes to add to the right,
// Fractional digits in the result are truncated.
// TODO: Maybe we should error if we're truncating digits instead?
//
// A few examples:
//     _parseScientific('1.4e2') == BigNumber.from(140)
//     _parseScientific('-2') == BigNumber.from(-2)
//     _parseScientific('0.5', 18) == BigNumber.from(5).mul(pow10(17))
//     _parseScientific('0.127e2') == BigNumber.from(12)
function _parseScientific(s: string, scale: BigNumberish = 0): BigNumber {
  // Scientific Notation: <INT>(.<DIGITS>)?(e<INT>)?
  // INT: [+-]?DIGITS
  // DIGITS: \d+
  const match = s.match(
    /^(?<sign>[+-]?)(?<intPart>\d+)(\.(?<fracPart>\d+))?(e(?<exponent>[+-]?\d+))?$/
  )
  if (!match || !match.groups) throw new Error(`Illegal decimal string ${s}`)

  const sign = match.groups.sign === '-' ? -1 : 1
  let intPart = BigNumber.from(match.groups.intPart)
  const fracPart = match.groups.fracPart ? BigNumber.from(match.groups.fracPart) : ZERO
  let exponent = match.groups.exponent ? BigNumber.from(match.groups.exponent) : ZERO
  exponent = exponent.add(scale)

  // "zero" the fractional part by shifting it into intPart, keeping the overall value equal
  if (!fracPart.eq(ZERO)) {
    const shiftDigits = match.groups.fracPart.length
    intPart = intPart.mul(pow10(shiftDigits)).add(fracPart)
    exponent = exponent.sub(shiftDigits)
  }

  // Shift intPart left or right as exponent requires
  const positiveOutput: BigNumber = exponent.gte(ZERO)
    ? intPart.mul(pow10(exponent))
    : intPart.div(pow10(exponent.abs()))

  return positiveOutput.mul(sign)
}

export const ZERO = bn(0)
export const ONE = bn('1e18')
