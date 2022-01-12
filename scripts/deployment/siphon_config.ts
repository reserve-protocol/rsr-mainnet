import { bn } from '../../common/numbers'
import { BigNumberish } from 'ethers'

type Siphon = {
  from: string
  to: string
  weight: BigNumberish
}

// Upgrade siphons

export const UPGRADE_SIPHONS: Siphon[] = [
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.035e18'),
    to: '0x774cdf60F32eB1022801c4b629FdfC9AeB0C1A69',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.049e18'),
    to: '0x379AD184932aBDE64F7A6dd8728114Ad5D872Dfc',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.055e18'),
    to: '0x08c8f38156eC1E30365CfC3848223ce5f12806fD',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.046e18'),
    to: '0x06167BA5f91Ad31711Aef02b1AD2b9eaffb47101',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.05e18'),
    to: '0xe1b23473b30C6834cdcf973615017630c7800b4a',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.036e18'),
    to: '0x3C108E94c395398F534f6F18d578b3aA84c6BCCC',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.0435e18'),
    to: '0xD25096bcd013dAFBeC27c785Cf79D58Acf3c3092',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.0435e18'),
    to: '0x5475f3Bf6b325b5f141740AD93daE50B5Aae3fbd',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.046e18'),
    to: '0x2969ACE89570EF6Cf863887ED42E9cFb7a2864ac',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.036e18'),
    to: '0x891df2154895D3582DEf9C928F731963b74A0E01',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.049e18'),
    to: '0x7D61c72cE44fCF9099c371810F039E7Dc6D0fDBd',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.055e18'),
    to: '0x54fac320F9BfDcAdD829525a7e2D31AeAFAE71BB',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.036e18'),
    to: '0x0557ABA984d10622d3B66ad5e7eD3cA141C20268',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.0435e18'),
    to: '0x3423153ef621FacD3AB474DF87F4AFe8f5E3CC9B',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.0435e18'),
    to: '0xcC544A65aBD12007190240D68EF88AA0E5a5a0c3',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.046e18'),
    to: '0x42aBBDc027d1Ef81e97F352F515768613aC81eB6',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.046e18'),
    to: '0x8D5EAee131F39F0aBB301A8E6bD14fDbB0cC5C9d',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.05e18'),
    to: '0xadD6a538D588c511a833fb7cAF44108D4588017C',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.036e18'),
    to: '0x030ff2326AC9011E06DF1a2c54b362ABB14E0c79',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.0435e18'),
    to: '0x5bCEDD2dB60F4994863e85fc69cFE0EDc1392FF0',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.0435e18'),
    to: '0x1d1A4Ee2B1f427776E28418e9573B742F6cB28B9',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.01e18'),
    to: '0x98DafDd1DC963785717c7e673533F5e05117AE05',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.036e18'),
    to: '0xE07B955c7aA98c14Eb2AFFD36A575a8722F1105F',
  },
  {
    from: '0xc4bf963aa86f272af84796c160598d326e6d3078',
    weight: bn('0.022e18'),
    to: '0xeF475E27c6586019FF79A6b600c89Bb6D39D23fb',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.14e18'),
    to: '0x5671037C789c46507cfDC3b3A2077499bD4496A4',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.098e18'),
    to: '0xa6A0e8aF5d2b57CFEF1FC07D57b2Cd2f468d9B83',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.11e18'),
    to: '0x49c20c83EBB7a3722b9615B0133bf5e1B677f4e8',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.092e18'),
    to: '0xf1fed6Ad8845206Fe4f570FB0fa10E5518D2D53A',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.1e18'),
    to: '0xcb3b9173E65e64F66618a7bf88ea456f9e4983d9',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.072e18'),
    to: '0x362Fc673B5B7DF6B407038E670E331726e67cB73',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.087e18'),
    to: '0x4550bFD2Bebac08B5CE368630f6F17e272419cdc',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.087e18'),
    to: '0xFb647dC2bc3F02507FCa4c97E8241c7a03CE9Abe',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.092e18'),
    to: '0x2AcefB268978f45d131B1ae296dfA179e0D18a95',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.072e18'),
    to: '0xfc787375ffb55d780CF8E12a75A960B757a138A6',
  },
  {
    from: '0x8ad9c8ebe26eadab9251b8fc36cd06a1ec399a7f',
    weight: bn('0.05e18'),
    to: '0xDf181778E2e10EfcEd7523c8243e585B96CdF5c0',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.14e18'),
    to: '0x7F68766857f1277F263AfE67B8B753BA57a12B68',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.098e18'),
    to: '0x286eA6A57c50fd35d65eB4264254b29E5a421AAA',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.11e18'),
    to: '0x8e52EF47605392D58df217Cf1E84cbdF99442c90',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.092e18'),
    to: '0xDB0850A46548441cA611B204AD1b6Bd00aff0F9c',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.1e18'),
    to: '0x051D587f225A41FF2956Cf73cd3812f17c939cCE',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.072e18'),
    to: '0xea8F2f3e1aED132179E38D777C20a8bdE9997f5E',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.087e18'),
    to: '0xBd8a78A1e4707278d0cda90F5f528F180a2ceA79',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.087e18'),
    to: '0xB7D09f63d4C49D848bDe012c8A77F0E9f90697ff',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.092e18'),
    to: '0xA67CAaD6A6daD70041F5320CbdA20c22Be6dc7D7',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.072e18'),
    to: '0x192453EeEB10fc1eD8a10309a15994Df6B47b1ae',
  },
  {
    from: '0xb268c230720d16c69a61cbee24731e3b2a3330a1',
    weight: bn('0.05e18'),
    to: '0x65F325D33e5940E0e8649090e614Ee838dFf9eed',
  },
  {
    from: '0x24B4a6847cCb32972de40170C02FdA121DdC6a30',
    weight: bn('0.1023782e18'),
    to: '0xF51987598F208851Fb44d7991Ef803BB26a5a61f',
  },
  {
    from: '0x24B4a6847cCb32972de40170C02FdA121DdC6a30',
    weight: bn('0.2023827e18'),
    to: '0x36B097f718d9341369A928529AcEfc3D792948af',
  },
  {
    from: '0x24B4a6847cCb32972de40170C02FdA121DdC6a30',
    weight: bn('0.3023827e18'),
    to: '0xcff68308E75d0110a6364C3c4B913862071FebF8',
  },
  {
    from: '0x24B4a6847cCb32972de40170C02FdA121DdC6a30',
    weight: bn('0.3928564e18'),
    to: '0x8D931DE1224160fffa9207626b11044822dc2d85',
  },
  {
    from: '0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA',
    weight: bn('0.1012673e18'),
    to: '0x8233a34fA1f0AF4fa3710d367F56F479800F16D9',
  },
  {
    from: '0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA',
    weight: bn('0.2023321e18'),
    to: '0x39E42CC24f84C10eC66a1dFc319ddE03fd798D79',
  },
  {
    from: '0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA',
    weight: bn('0.3027827e18'),
    to: '0x5a8c6bF49dB4516B0ab88447b7cF3617fBdc400e',
  },
  {
    from: '0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA',
    weight: bn('0.3936179e18'),
    to: '0x12a9Eb74c601233f4A844E1F78A3b3959cb29aEf',
  },
  {
    from: '0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb',
    weight: bn('0.1023782e18'),
    to: '0x17Fb344Aa8b0ce4B8C8cf2E3a81cB1313aE937ce',
  },
  {
    from: '0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb',
    weight: bn('0.2023827e18'),
    to: '0x94754b42A2AF29e0468f56C9B32fdDC7dEC6d98B',
  },
  {
    from: '0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb',
    weight: bn('0.3023827e18'),
    to: '0xD8F2D6880d728cd3a48906Fd44d993819C212B82',
  },
  {
    from: '0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb',
    weight: bn('0.3928564e18'),
    to: '0x057e009e6160092283F4862DF00E4eA7F537D6cf',
  },
  {
    from: '0x5f57bbccc7ffa4c46864b5ed999a271bc36bb0ce',
    weight: bn('0.1023782e18'),
    to: '0x1bebCC3AEd7b4CbD93Fc748597c947AeB583a252',
  },
  {
    from: '0x5f57bbccc7ffa4c46864b5ed999a271bc36bb0ce',
    weight: bn('0.2023827e18'),
    to: '0x29aAA1AE379CcfA8976FFB6211B4734E9b8Cc967',
  },
  {
    from: '0x5f57bbccc7ffa4c46864b5ed999a271bc36bb0ce',
    weight: bn('0.3023827e18'),
    to: '0x5d8DB28405e44c16068Bb82D0aDE924e4b757068',
  },
  {
    from: '0x5f57bbccc7ffa4c46864b5ed999a271bc36bb0ce',
    weight: bn('0.3928564e18'),
    to: '0xef62209bB9DFa07906089AF418Cd23184DF95247',
  },
  {
    from: '0x9e454fe7d8e087fcac4ec8c40562de781004477e',
    weight: bn('0.1e18'),
    to: '0xc7fE5964B2327008D532B3d60822eB288651af85',
  },
  {
    from: '0x9e454fe7d8e087fcac4ec8c40562de781004477e',
    weight: bn('0.2e18'),
    to: '0xe1869e50C297c96d59fBDDc7bF0dAD37C9587493',
  },
  {
    from: '0x9e454fe7d8e087fcac4ec8c40562de781004477e',
    weight: bn('0.3e18'),
    to: '0x6Eeb3f390d30138dAd669d1C310749D3C5BfB79B',
  },
  {
    from: '0x9e454fe7d8e087fcac4ec8c40562de781004477e',
    weight: bn('0.4e18'),
    to: '0x86b60668519649E7A4a1374Db0Bb0572A498a98F',
  },
  {
    from: '0xc59119d8e4d129890036a108aed9d9fe94db1ba9',
    weight: bn('0.1e18'),
    to: '0x794A044323172908D48e782c8db939B0Df7f83ae',
  },
  {
    from: '0xc59119d8e4d129890036a108aed9d9fe94db1ba9',
    weight: bn('0.2e18'),
    to: '0xd60A1A08582f0B3f5f2cC47862DC8b5B5d1988cb',
  },
  {
    from: '0xc59119d8e4d129890036a108aed9d9fe94db1ba9',
    weight: bn('0.3e18'),
    to: '0x954793ee97503195B0D27af85002320f290dc860',
  },
  {
    from: '0xc59119d8e4d129890036a108aed9d9fe94db1ba9',
    weight: bn('0.4e18'),
    to: '0x3D689FdB204A6bdB29aeb5c64de2871c451fB49A',
  },
  {
    from: '0x4fcc7ca22680aed155f981eeb13089383d624aa9',
    weight: bn('0.1e18'),
    to: '0xcDac44171d183528ABb016b214B08fe76C254032',
  },
  {
    from: '0x4fcc7ca22680aed155f981eeb13089383d624aa9',
    weight: bn('0.2e18'),
    to: '0x6C081F0A4D7af43ED2f257CA6bAff6059e26F129',
  },
  {
    from: '0x4fcc7ca22680aed155f981eeb13089383d624aa9',
    weight: bn('0.3e18'),
    to: '0x6dbb05d50BE6dA5f255C3Cd182a3E14C69DB634F',
  },
  {
    from: '0x4fcc7ca22680aed155f981eeb13089383d624aa9',
    weight: bn('0.4e18'),
    to: '0x328ac69Cc6dbd41060F67e3D85491b3ef41a2ea4',
  },
  {
    from: '0xfc2e9a5cd1bb9b3953ffa7e6ddf0c0447eb95f11',
    weight: bn('0.1e18'),
    to: '0xb0a320d3Ed2B0f07282B1c89002f31BE913F4849',
  },
  {
    from: '0xfc2e9a5cd1bb9b3953ffa7e6ddf0c0447eb95f11',
    weight: bn('0.2e18'),
    to: '0x9022dC2347F7050a752dFfa63F306022a583e8E1',
  },
  {
    from: '0xfc2e9a5cd1bb9b3953ffa7e6ddf0c0447eb95f11',
    weight: bn('0.3e18'),
    to: '0x536e10bE5cED4b0D153E7433512964789448586e',
  },
  {
    from: '0xfc2e9a5cd1bb9b3953ffa7e6ddf0c0447eb95f11',
    weight: bn('0.4e18'),
    to: '0xAbD92344c1e4B6e0acbf206d4ACe029D639a3a53',
  },
  {
    from: '0x8d29a24f91df381feb4ee7f05405d3fb888c643e',
    weight: bn('0.1e18'),
    to: '0xd6eD2D91816276b5b52791546A6E0f236afEe840',
  },
  {
    from: '0x8d29a24f91df381feb4ee7f05405d3fb888c643e',
    weight: bn('0.2e18'),
    to: '0x62e6EcfEF0355B83Da93Cb57eBa0148a16b1bc8b',
  },
  {
    from: '0x8d29a24f91df381feb4ee7f05405d3fb888c643e',
    weight: bn('0.3e18'),
    to: '0xFA163382e1a696362E74CA1fC47D2037B2Dd5676',
  },
  {
    from: '0x8d29a24f91df381feb4ee7f05405d3fb888c643e',
    weight: bn('0.4e18'),
    to: '0x0F7706ddf2D7dF0597683BAf02BeE142a534F206',
  },
  {
    from: '0x63c5ffb388d83477a15eb940cfa23991ca0b30f0',
    weight: bn('0.1e18'),
    to: '0x44F84ED0D2f2fb5d5dee313B037150FB0eea91B5',
  },
  {
    from: '0x63c5ffb388d83477a15eb940cfa23991ca0b30f0',
    weight: bn('0.2e18'),
    to: '0x462cACa81f6a41C6d06138947dd134C907A178e1',
  },
  {
    from: '0x63c5ffb388d83477a15eb940cfa23991ca0b30f0',
    weight: bn('0.3e18'),
    to: '0xBe6C39CB2C166A6E93069F72623772F42eaF78A1',
  },
  {
    from: '0x63c5ffb388d83477a15eb940cfa23991ca0b30f0',
    weight: bn('0.4e18'),
    to: '0x6Ba785faDaA1CcA3dA7DdCF5e8dc94f0747C1f80',
  },
  {
    from: '0x5f84660cabb98f7b7764cd1ae2553442da91984e',
    weight: bn('0.1e18'),
    to: '0x9f0E6C9d4e73e715f744993191a90A8dE201D830',
  },
  {
    from: '0x5f84660cabb98f7b7764cd1ae2553442da91984e',
    weight: bn('0.2e18'),
    to: '0x9035771D02E2422d85976040c427e8B36776a4b9',
  },
  {
    from: '0x5f84660cabb98f7b7764cd1ae2553442da91984e',
    weight: bn('0.3e18'),
    to: '0x4f7cad9D799b256b8a45d7B00aB66B5E1843d2E8',
  },
  {
    from: '0x5f84660cabb98f7b7764cd1ae2553442da91984e',
    weight: bn('0.4e18'),
    to: '0x5a2EDbC829F14F23Ed8ba169a0EA0bBD7aeb91F5',
  },
  {
    from: '0xc3aa4ced5dea58a3d1ca76e507515c79ca1e4436',
    weight: bn('0.1e18'),
    to: '0xF04a0FAca77239a508cC93F0d7e944C6e754eBbc',
  },
  {
    from: '0xc3aa4ced5dea58a3d1ca76e507515c79ca1e4436',
    weight: bn('0.2e18'),
    to: '0x1b752DC3450beF2E6EA5f57CE5Fae72A5F73c5Ca',
  },
  {
    from: '0xc3aa4ced5dea58a3d1ca76e507515c79ca1e4436',
    weight: bn('0.3e18'),
    to: '0x6a72cE334a16B842baDA84c2A6f474De3a660905',
  },
  {
    from: '0xc3aa4ced5dea58a3d1ca76e507515c79ca1e4436',
    weight: bn('0.4e18'),
    to: '0x0e241fc10a5FBA63f8BD9150000e6e798cefBE81',
  },
  {
    from: '0x47fc47cbcc5217740905e16c4c953b2f247369d2',
    weight: bn('0.1e18'),
    to: '0x008b26999De58A891023A9582b21b8daa0323a03',
  },
  {
    from: '0x47fc47cbcc5217740905e16c4c953b2f247369d2',
    weight: bn('0.2e18'),
    to: '0xA83CA3AFF44B17A8386fd6747eFF20A06eBB1419',
  },
  {
    from: '0x47fc47cbcc5217740905e16c4c953b2f247369d2',
    weight: bn('0.3e18'),
    to: '0x536eAfeBb8d82F154bbCA8a59f42267966d75E34',
  },
  {
    from: '0x47fc47cbcc5217740905e16c4c953b2f247369d2',
    weight: bn('0.4e18'),
    to: '0x0928844D610661B49AA8749673eE481987f0C62e',
  },
  {
    from: '0x082705fabf49bd30de8f0222821f6d940713b89d',
    weight: bn('0.1e18'),
    to: '0x77573D54dD0B56C8661cA2092Ee09F9406886725',
  },
  {
    from: '0x082705fabf49bd30de8f0222821f6d940713b89d',
    weight: bn('0.2e18'),
    to: '0x1a9A9e6FA2b0DF69406F7994987510B64DAC6D20',
  },
  {
    from: '0x082705fabf49bd30de8f0222821f6d940713b89d',
    weight: bn('0.3e18'),
    to: '0x23403c5534C6a3cDfFcc06263e8b451b72E93Db8',
  },
  {
    from: '0x082705fabf49bd30de8f0222821f6d940713b89d',
    weight: bn('0.4e18'),
    to: '0x63Ba79503643F03F5426fFffFc373e70eFAA3D12',
  },
  {
    from: '0xcb2d434bf72d3cd43d0c368493971183640ffe99',
    weight: bn('0.1e18'),
    to: '0x74D0768Bd0851CEfC17D1adabDf534938B7Aa1Ad',
  },
  {
    from: '0xcb2d434bf72d3cd43d0c368493971183640ffe99',
    weight: bn('0.2e18'),
    to: '0x52b0b7a0A6BeD68B3a6f9F884863d89713429fd8',
  },
  {
    from: '0xcb2d434bf72d3cd43d0c368493971183640ffe99',
    weight: bn('0.3e18'),
    to: '0x7feC349Da1a1fBa7d0265446342F48780bb04589',
  },
  {
    from: '0xcb2d434bf72d3cd43d0c368493971183640ffe99',
    weight: bn('0.4e18'),
    to: '0x63A6632609C193B177e04277cbc908D01BE72423',
  },
  {
    from: '0xde59cd3aa43a2bf863723662b31906660c7d12b6',
    weight: bn('0.1e18'),
    to: '0x404EfB4C2e23BbcF429c993bB40490BE78d628DE',
  },
  {
    from: '0xde59cd3aa43a2bf863723662b31906660c7d12b6',
    weight: bn('0.2e18'),
    to: '0x5ff1Eeb9d9704577D3c1d7eC910861906D08BB16',
  },
  {
    from: '0xde59cd3aa43a2bf863723662b31906660c7d12b6',
    weight: bn('0.3e18'),
    to: '0xEDb765C6BBFA04Fe74C86e8aa4a284E2594422cb',
  },
  {
    from: '0xde59cd3aa43a2bf863723662b31906660c7d12b6',
    weight: bn('0.4e18'),
    to: '0x4872E23216cF74B5440F59219497b339b93461A5',
  },
  {
    from: '0x3ac7a6c3a2ff08613b611485f795d07e785cbb95',
    weight: bn('0.1e18'),
    to: '0x8A0A6C017a6F0FDE5AFBF0090e78bF92322B36A5',
  },
  {
    from: '0x3ac7a6c3a2ff08613b611485f795d07e785cbb95',
    weight: bn('0.2e18'),
    to: '0xfe7677dB081388DC65fd4fFE61e97D8a9Cdd9F73',
  },
  {
    from: '0x3ac7a6c3a2ff08613b611485f795d07e785cbb95',
    weight: bn('0.3e18'),
    to: '0xceA17912e8718EBB0C97702D6f3cd9AbbdA38Ad3',
  },
  {
    from: '0x3ac7a6c3a2ff08613b611485f795d07e785cbb95',
    weight: bn('0.4e18'),
    to: '0xAEA3916B5d6095564d8ea776E3ECD614189DBD78',
  },
  {
    from: '0xefbaaf73fc22f70785515c1e2be3d5ba2fb8e9b0',
    weight: bn('0.1e18'),
    to: '0x552Be8F9DD7f356adef19be0e67aE8c995E1Ab0E',
  },
  {
    from: '0xefbaaf73fc22f70785515c1e2be3d5ba2fb8e9b0',
    weight: bn('0.2e18'),
    to: '0xA527cE60d03A3549620a008c1cF8a3177dc115ae',
  },
  {
    from: '0xefbaaf73fc22f70785515c1e2be3d5ba2fb8e9b0',
    weight: bn('0.3e18'),
    to: '0xA47FC36Bc3765358e966967f2d71780C9267B537',
  },
  {
    from: '0xefbaaf73fc22f70785515c1e2be3d5ba2fb8e9b0',
    weight: bn('0.4e18'),
    to: '0xdf5c22a18c6D3C15739FFfadcD85f566a7768Cc7',
  },
  {
    from: '0x5cf4bbb0ff093f3c725abec32fba8f34e4e98af1',
    weight: bn('0.1e18'),
    to: '0x62BA95aDc3dC0280D7A07364643F13FcB0994291',
  },
  {
    from: '0x5cf4bbb0ff093f3c725abec32fba8f34e4e98af1',
    weight: bn('0.2e18'),
    to: '0x3976AE1770B89b6681D877F3209ecf0dB8f495dE',
  },
  {
    from: '0x5cf4bbb0ff093f3c725abec32fba8f34e4e98af1',
    weight: bn('0.3e18'),
    to: '0x69d4EB63b76C2fb05B9b5397d659524A83c787e3',
  },
  {
    from: '0x5cf4bbb0ff093f3c725abec32fba8f34e4e98af1',
    weight: bn('0.4e18'),
    to: '0x5fB5A5dCBd75197d0318A44FBB6012304bD9E44f',
  },
  {
    from: '0x66f25f036eb4463d8a45c6594a325f9e89baa6db',
    weight: bn('0.1e18'),
    to: '0xE2Ab3458cd61fa6A57d128d6EAaC015a47053Cd9',
  },
  {
    from: '0x66f25f036eb4463d8a45c6594a325f9e89baa6db',
    weight: bn('0.2e18'),
    to: '0xC592dD780E0016B9B5436c005435c2e2c1529882',
  },
  {
    from: '0x66f25f036eb4463d8a45c6594a325f9e89baa6db',
    weight: bn('0.3e18'),
    to: '0xa671532eF1010883EF21Bb5408BbbA1519561FEf',
  },
  {
    from: '0x66f25f036eb4463d8a45c6594a325f9e89baa6db',
    weight: bn('0.4e18'),
    to: '0x2e90BDd3bEFbdca1e780B573aD74cE942955B4CA',
  },
  {
    from: '0x5a7350d95b9e644dcab4bc642707f43a361bf628',
    weight: bn('0.1e18'),
    to: '0x60A410062F28B5B6b503Bb8bF8EFeBA2D1A31EB9',
  },
  {
    from: '0x5a7350d95b9e644dcab4bc642707f43a361bf628',
    weight: bn('0.2e18'),
    to: '0xB4839d0b07668a2095C8307AB42bF3867242faC4',
  },
  {
    from: '0x5a7350d95b9e644dcab4bc642707f43a361bf628',
    weight: bn('0.3e18'),
    to: '0xBfB04cB3b4B8f1f22A64AF8e3701F91814e3d071',
  },
  {
    from: '0x5a7350d95b9e644dcab4bc642707f43a361bf628',
    weight: bn('0.4e18'),
    to: '0x9A91AC798b16fc6BB348C5Cb3d3Ffc7ef200e5BF',
  },
  {
    from: '0xcfef27288bedcd587a1ed6e86a996c8c5b01d7c1',
    weight: bn('0.1e18'),
    to: '0xfb15a3C8B8A257dB077A65eC53FF2046787A0085',
  },
  {
    from: '0xcfef27288bedcd587a1ed6e86a996c8c5b01d7c1',
    weight: bn('0.2e18'),
    to: '0x31700bD38e3BC93a9C51c0f8816a3fe40bC31514',
  },
  {
    from: '0xcfef27288bedcd587a1ed6e86a996c8c5b01d7c1',
    weight: bn('0.3e18'),
    to: '0xd59B78051c1795c531221bF320398386950AD185',
  },
  {
    from: '0xcfef27288bedcd587a1ed6e86a996c8c5b01d7c1',
    weight: bn('0.4e18'),
    to: '0x54925d79bf5d4AD8378baF4aA8fC1A213431c271',
  },
  {
    from: '0xbe30069d27a250f90c2ee5507bcaca5f868265f7',
    weight: bn('0.1e18'),
    to: '0x819b593aC8De75c0F1dc11d2A6Bbe2b9404a8E94',
  },
  {
    from: '0xbe30069d27a250f90c2ee5507bcaca5f868265f7',
    weight: bn('0.2e18'),
    to: '0xB6c980544508b7db8ad9032cCb9A4987BE76fA45',
  },
  {
    from: '0xbe30069d27a250f90c2ee5507bcaca5f868265f7',
    weight: bn('0.3e18'),
    to: '0xd8d0a326a007F472D86E03C3b7629F5B4e71C621',
  },
  {
    from: '0xbe30069d27a250f90c2ee5507bcaca5f868265f7',
    weight: bn('0.4e18'),
    to: '0xb286643290Ca87e34f6f3a8c4EAB0DA37BfbFeEB',
  },
  {
    from: '0xd282337950ac6e936d0f0ebaaff1ffc3de79f3d5',
    weight: bn('0.1e18'),
    to: '0x4add5A47D7abcba09F65621c5fD3333505559Ccc',
  },
  {
    from: '0xd282337950ac6e936d0f0ebaaff1ffc3de79f3d5',
    weight: bn('0.2e18'),
    to: '0x9a01BCEba145962aB8Bb6a55fe897A3B3B286917',
  },
  {
    from: '0xd282337950ac6e936d0f0ebaaff1ffc3de79f3d5',
    weight: bn('0.3e18'),
    to: '0xfAd60348410B878265679AfaA4203fef4013c312',
  },
  {
    from: '0xd282337950ac6e936d0f0ebaaff1ffc3de79f3d5',
    weight: bn('0.4e18'),
    to: '0xB9D58Cc331B9547B640bed34337C2D6deD210cB1',
  },
  {
    from: '0x5a66650e5345d76eb8136ea1490cbcce1c08072e',
    weight: bn('0.1e18'),
    to: '0x5B357EaE1fb1db3590afebE2acd2f736Db33b3cF',
  },
  {
    from: '0x5a66650e5345d76eb8136ea1490cbcce1c08072e',
    weight: bn('0.2e18'),
    to: '0xEaDc12E4416A71E04901ab69724985a66ac2E6Dc',
  },
  {
    from: '0x5a66650e5345d76eb8136ea1490cbcce1c08072e',
    weight: bn('0.3e18'),
    to: '0xdFeD9e1c8C08e66481fD11D200FFB9B003A986aE',
  },
  {
    from: '0x5a66650e5345d76eb8136ea1490cbcce1c08072e',
    weight: bn('0.4e18'),
    to: '0xb5CE7d7ABFd589eba233D3B6f366b657831b9c2D',
  },
  {
    from: '0x942dcbc5f83f954d71f06321ef90ac3b0d0b9c8a',
    weight: bn('0.1e18'),
    to: '0x01d9a62Da0094a948dd2113D8B11eCd8fa653fa8',
  },
  {
    from: '0x942dcbc5f83f954d71f06321ef90ac3b0d0b9c8a',
    weight: bn('0.2e18'),
    to: '0x4E1B415fA2b727691322BE15e555d527E404222E',
  },
  {
    from: '0x942dcbc5f83f954d71f06321ef90ac3b0d0b9c8a',
    weight: bn('0.3e18'),
    to: '0xb5ab4BF4Ce5779b165C4A64f0d5a5BC388B13F0a',
  },
  {
    from: '0x942dcbc5f83f954d71f06321ef90ac3b0d0b9c8a',
    weight: bn('0.4e18'),
    to: '0x758aBb104467897da20d1d2Db47869D7bEe37869',
  },
  {
    from: '0xDF437625216cCa3d7148E18d09F4aAB0D47c763b',
    weight: bn('0.1e18'),
    to: '0x244327cfe5a7AAcd313Fe643ad185536d29CEd30',
  },
  {
    from: '0xDF437625216cCa3d7148E18d09F4aAB0D47c763b',
    weight: bn('0.2e18'),
    to: '0x7Ed99076E22fe2C321D65715dea526FD3E11B8CB',
  },
  {
    from: '0xDF437625216cCa3d7148E18d09F4aAB0D47c763b',
    weight: bn('0.3e18'),
    to: '0x1D8d61d64696A9e29673eDB8a05df6f824Ac1359',
  },
  {
    from: '0xDF437625216cCa3d7148E18d09F4aAB0D47c763b',
    weight: bn('0.4e18'),
    to: '0x8357322C624219300d266092d6766FA1EB43F9A5',
  },
  {
    from: '0x02fc8e99401b970c265480140721b28bb3af85ab',
    weight: bn('1e18'),
    to: '0x03bd5fa10bFe2d92F5998d80a88600A98F46d330',
  },
  {
    from: '0x657a127639b9e0ccccfbe795a8e394d5ca158526',
    weight: bn('1e18'),
    to: '0x93E5cC54Be10e99568D357a3E15438f56eFD840F',
  },
  {
    from: '0xba385610025b1ea8091ae3e4a2e98913e2691ff7',
    weight: bn('1e18'),
    to: '0x465E689865D221b49e9938e85bD2C3355f5B6941',
  },
  {
    from: '0xcd74834b8f3f71d2e82c6240ae0291c563785356',
    weight: bn('1e18'),
    to: '0xaFD2A2bf874B1B5be69bdC46AC64b250f0787918',
  },
  {
    from: '0xd28661e4c75d177d9c1f3c8b821902c1abd103a6',
    weight: bn('1e18'),
    to: '0xF21229F30De4D980279484e0dFb7A92EcF47C06a',
  },
  {
    from: '0xbae85de9858375706dde5907c8c9c6ee22b19212',
    weight: bn('1e18'),
    to: '0xad2BfC69f71FE3DFc94193c5C91Af6d521fb56cf',
  },
  {
    from: '0xe7ad11517d7254f6a0758cee932bffa328002dd0',
    weight: bn('1e18'),
    to: '0x8792b0E6Aae17Ac58333548F156656aEE179552C',
  },
  {
    from: '0x6b39195c164d693d3b6518b70d99877d4f7c87ef',
    weight: bn('1e18'),
    to: '0x7AbbdEE2153b734796aE3AE3Fb687E1e0C879861',
  },
  {
    from: '0x6b55187ec97cd9ae8831a11614c95042fc621361',
    weight: bn('1e18'),
    to: '0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770',
  },
  {
    from: '0x4903dc97816f99410e8dfff51149fa4c3cdad1b8',
    weight: bn('1e18'),
    to: '0x6bab6EB87Aa5a1e4A8310C73bDAAA8A5dAAd81C1',
  },
  {
    from: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
    weight: bn('1e18'),
    to: '0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770',
  },
]
