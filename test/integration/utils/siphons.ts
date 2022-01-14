import { UPGRADE_SIPHONS as siphons } from '../../../scripts/deployment/siphon_config'

const fs = require('fs')
const { join } = require('path')

const holderData = fs.readFileSync(
  join(__dirname, '../../../check-balances/oldrsr-holders.csv'),
  'utf8'
)
const siphonedBalancesData = fs.readFileSync(
  join(__dirname, '../../../check-balances/expected-siphon-results.txt'),
  'utf8'
)

const expectedBalances: { [x: string]: string } = siphonedBalancesData
  .split('\n')
  .reduce((current: any, line: any) => {
    if (line) {
      const [address, balance] = line.split(' ')
      current[address] = balance
    }

    return current
  }, {})

const siphonSources: Set<string> = new Set()
const siphonDestinations: Set<string> = new Set()
const siphonAddresses = siphons.reduce((prev, current) => {
  prev.add(current.from)
  siphonSources.add(current.from)
  prev.add(current.to)
  siphonDestinations.add(current.to)
  return prev
}, <Set<string>>new Set())

const holderAddresses = holderData
  .split('\n')
  .slice(1)
  .map((line: string) => {
    const address = line.split(',')[0].trim()

    return address.slice(1, address.length - 1)
  })
const normalHolders: string[] = []

for (const holderAddress of holderAddresses) {
  if (!siphonAddresses.has(holderAddress)) {
    normalHolders.push(holderAddress)
  }
}

export default {
  sources: siphonSources,
  destintations: siphonDestinations,
  addresses: siphonAddresses,
  holders: holderAddresses,
  expectedBalances,
}
