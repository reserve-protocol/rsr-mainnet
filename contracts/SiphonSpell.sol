// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./Spell.sol";

import "hardhat/console.sol";

/*
 * @title SiphonSpell
 * @dev A one-time-use atomic series of siphon actions, castable via RSR.castSpell()
 */
contract SiphonSpell is Spell {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// An allocation of weight that is to be siphoned
    struct Siphon {
        address to;
        uint64 weight; // 0 to MAX_WEIGHT
    }

    /// Invariant
    /// for addr in addrs: sum(siphons[addr]) = 1000
    mapping(address => Siphon[]) public siphons;
    EnumerableSet.AddressSet internal addrs;

    constructor(RSR rsr_) Spell(rsr_) {
        address sink = 0x0000000000000000000000000000000000000003; // random address
        uint64 half = rsr_.WEIGHT_ONE() / 2;

        // Add siphons here. Right now it's just 50% for everyone to show what it looks like.
        // _planSiphon(0x8AD9C8ebE26eAdAb9251B8fC36Cd06A1ec399a7F, Siphon(sink, half));
        // _planSiphon(0xb268c230720D16C69a61CBeE24731E3b2a3330A1, Siphon(sink, half));
        // _planSiphon(0x082705FaBF49BD30De8f0222821F6d940713b89D, Siphon(sink, half));
        // _planSiphon(0xc3Aa4cEd5DEa58A3d1cA76e507515c79cA1e4436, Siphon(sink, half));
        // _planSiphon(0x66F25f036eb4463d8A45C6594a325F9e89BAA6db, Siphon(sink, half));
        // _planSiphon(0x9e454Fe7d8e087fcac4ec8c40562dE781004477E, Siphon(sink, half));
        // _planSiphon(0x4fcc7cA22680aeD155F981EeB13089383D624aA9, Siphon(sink, half));
        // _planSiphon(0x5a66650e5345D76eb8136eA1490CbccE1c08072E, Siphon(sink, half));
        // _planSiphon(0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA, Siphon(sink, half));
        // _planSiphon(0xDF437625216cCa3d7148E18d09F4aAB0D47c763b, Siphon(sink, half));
        // _planSiphon(0x24B4a6847cCb32972de40170C02FdA121DdC6a30, Siphon(sink, half));
        // _planSiphon(0x8D29A24F91DF381FEb4ee7F05405D3fB888c643e, Siphon(sink, half));
        // _planSiphon(0x5a7350d95b9e644dCAb4bC642707F43A361BF628, Siphon(sink, half));
        // _planSiphon(0xfC2E9A5CD1Bb9b3953fFA7e6Ddf0c0447Eb95f11, Siphon(sink, half));
        // _planSiphon(0x3aC7A6C3A2Ff08613b611485F795D07E785cBb95, Siphon(sink, half));
        // _planSiphon(0x47Fc47CbcC5217740905e16C4C953B2f247369D2, Siphon(sink, half));
        // _planSiphon(0xd282337950Ac6e936D0F0eBAaFf1Ffc3dE79F3d5, Siphon(sink, half));
        // _planSiphon(0xDE59cD3Aa43a2bF863723662B31906660C7D12b6, Siphon(sink, half));
        // _planSiphon(0x5f84660Cabb98F7b7764cD1AE2553442Da91984E, Siphon(sink, half));
        // _planSiphon(0xeFbAaF73FC22f70785515C1e2Be3d5ba2Fb8E9B0, Siphon(sink, half));
        // _planSiphon(0x63c5FFB388d83477a15Eb940cFa23991CA0b30F0, Siphon(sink, half));
        // _planSiphon(0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb, Siphon(sink, half));
        // _planSiphon(0xbE30069D27a250F90C2EE5507Bcaca5F868265f7, Siphon(sink, half));
        // _planSiphon(0xcFeF27288bEDcd587A1eD6E86a996C8C5B01D7c1, Siphon(sink, half));
        // _planSiphon(0x5f57BBccc7fFa4C46864B5ed999A271bc36bB0Ce, Siphon(sink, half));
        // _planSiphon(0xbaE85De9858375706ddE5907c8C9c6eE22b19212, Siphon(sink, half));
        // _planSiphon(0x5cF4bBb0FF093F3c725AbEC32fBA8f34E4E98Af1, Siphon(sink, half));
        // _planSiphon(0xCb2D434Bf72D3cD43d0C368493971183640fFE99, Siphon(sink, half));
        // _planSiphon(0x02fc8e99401B970C265480140721B28bb3Af85AB, Siphon(sink, half));
        // _planSiphon(0xe7aD11517D7254F6A0758cEe932bFfa328002Dd0, Siphon(sink, half));
        // _planSiphon(0x6B39195c164D693D3B6518B70d99877d4F7C87Ef, Siphon(sink, half));
        // _planSiphon(0xc59119d8E4D129890036a108Aed9d9FE94dB1BA9, Siphon(sink, half));
        // _planSiphon(0xD28661e4c75d177d9C1F3c8B821902c1Abd103A6, Siphon(sink, half));
        // _planSiphon(0xbA385610025b1ea8091Ae3E4A2E98913E2691ff7, Siphon(sink, half));
        // _planSiphon(0xcD74834B8F3F71d2e82C6240Ae0291c563785356, Siphon(sink, half));
        // _planSiphon(0x657a127639b9e0CccCfBe795A8e394d5ca158526, Siphon(sink, half));
        // ...more, and probably most accounts will have 2 outgoing edges rather than 1
    }

    function cast() external override onlyRSR onceOnly {
        // uint64 max = rsr.WEIGHT_ONE();
        // uint64 sum;
        address addr;
        console.log(addrs.length());
        for (uint256 i = 0; i < addrs.length(); i++) {
            // sum = 0;
            addr = addrs.at(i);

            console.log("--");
            Siphon[] storage s = siphons[addr];

            console.log(s.length);
            for (uint256 j = 0; j < s.length; j++) {
                // sum += siphons[addrs.at(i)][j].weight;
                // rsr.siphon(addr, addr, siphons[addr][j].to, siphons[addr][j].weight);
            }
            // require(sum <= max, "sum for addr > MAX_WEIGHT");
        }
    }

    function _planSiphon(address addr, Siphon memory s) internal {
        addrs.add(addr);
        siphons[addr].push(s);
    }
}
