
interface INetworkConfig {
  name: string
  rsrPrev?: string
  rsr?: string
  siphonSpell?: string
  upgradeSpell?: string
}

export const networkConfig: { [key: string]: INetworkConfig } = {
  default: {
    name: 'hardhat',
  },
  '31337': {
    name: 'localhost',
    rsrPrev: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    rsr: '0xF8e31cb472bc70500f08Cd84917E5A1912Ec8397',
    siphonSpell: '0xc0F115A19107322cFBf1cDBC7ea011C19EbDB4F8' ,
    upgradeSpell: '0xc96304e3c037f81dA488ed9dEa1D8F2a48278a75' ,
  },
  '3': {
    name: 'ropsten',
    rsrPrev: '0x58408daf0664dc9ff4645414ce5f9ace059f0470',
    rsr: '<NEW_RSR_DEPLOYMENT>'
  },
  '1': {
    name: 'mainnet',
    rsrPrev: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    rsr: '<NEW_RSR_DEPLOYMENT>'
  },
}