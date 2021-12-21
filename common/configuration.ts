interface INetworkConfig {
  name: string
  oldRSR?: string
  companySafe?: string
}

export const networkConfig: { [key: string]: INetworkConfig } = {
  default: {
    name: 'hardhat',
  },
  // Config used for Mainnet forking -- Mirrors mainnet
  '31337': {
    name: 'localhost',
    oldRSR: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    companySafe: '0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770',
  },
  '3': {
    name: 'ropsten',
    oldRSR: '0x58408daf0664dc9ff4645414ce5f9ace059f0470',
    companySafe: '0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770',
  },
  '1': {
    name: 'mainnet',
    oldRSR: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    companySafe: '0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770',
  },
}

export const developmentChains = ['hardhat', 'localhost']
