// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./ISpell.sol";

/*
 * @title SiphonSpell
 * @dev An ERC20 insurance token for the Reserve Protocol ecosystem.
 */
contract SiphonSpell is ISpell {
    using EnumerableSet for EnumerableSet.AddressSet;

    RSR public immutable rsr;

    /// Invariant
    /// Once set to true, remains true
    bool public spent;

    /// An allocation of weight
    struct Alloc {
        address to;
        uint16 weight; // 1000 max
    }

    /// Invariant
    /// For all X: sum(allocs[X]) = 1000
    mapping(address => Alloc[]) public allocs;
    EnumerableSet.AddressSet internal addrs;

    constructor(RSR rsr_) {
        rsr = rsr_;
        address sink = 0x0000000000000000000000000000000000000000;
        uint16 half = 500;

        // This is where we add allocs. Right now it's just 50% for everyone.
        _alloc(0x8AD9C8ebE26eAdAb9251B8fC36Cd06A1ec399a7F, Alloc(sink, half));
        _alloc(0xb268c230720D16C69a61CBeE24731E3b2a3330A1, Alloc(sink, half));
        _alloc(0x082705FaBF49BD30De8f0222821F6d940713b89D, Alloc(sink, half));
        _alloc(0xc3Aa4cEd5DEa58A3d1cA76e507515c79cA1e4436, Alloc(sink, half));
        _alloc(0x66F25f036eb4463d8A45C6594a325F9e89BAA6db, Alloc(sink, half));
        _alloc(0x9e454Fe7d8e087fcac4ec8c40562dE781004477E, Alloc(sink, half));
        _alloc(0x4fcc7cA22680aeD155F981EeB13089383D624aA9, Alloc(sink, half));
        _alloc(0x5a66650e5345D76eb8136eA1490CbccE1c08072E, Alloc(sink, half));
        _alloc(0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA, Alloc(sink, half));
        _alloc(0xDF437625216cCa3d7148E18d09F4aAB0D47c763b, Alloc(sink, half));
        _alloc(0x24B4a6847cCb32972de40170C02FdA121DdC6a30, Alloc(sink, half));
        _alloc(0x8D29A24F91DF381FEb4ee7F05405D3fB888c643e, Alloc(sink, half));
        _alloc(0x5a7350d95b9e644dCAb4bC642707F43A361BF628, Alloc(sink, half));
        _alloc(0xfC2E9A5CD1Bb9b3953fFA7e6Ddf0c0447Eb95f11, Alloc(sink, half));
        _alloc(0x3aC7A6C3A2Ff08613b611485F795D07E785cBb95, Alloc(sink, half));
        _alloc(0x47Fc47CbcC5217740905e16C4C953B2f247369D2, Alloc(sink, half));
        _alloc(0xd282337950Ac6e936D0F0eBAaFf1Ffc3dE79F3d5, Alloc(sink, half));
        _alloc(0xDE59cD3Aa43a2bF863723662B31906660C7D12b6, Alloc(sink, half));
        _alloc(0x5f84660Cabb98F7b7764cD1AE2553442Da91984E, Alloc(sink, half));
        _alloc(0xeFbAaF73FC22f70785515C1e2Be3d5ba2Fb8E9B0, Alloc(sink, half));
        _alloc(0x63c5FFB388d83477a15Eb940cFa23991CA0b30F0, Alloc(sink, half));
        _alloc(0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb, Alloc(sink, half));
        _alloc(0xbE30069D27a250F90C2EE5507Bcaca5F868265f7, Alloc(sink, half));
        _alloc(0xcFeF27288bEDcd587A1eD6E86a996C8C5B01D7c1, Alloc(sink, half));
        _alloc(0x5f57BBccc7fFa4C46864B5ed999A271bc36bB0Ce, Alloc(sink, half));
        _alloc(0xbaE85De9858375706ddE5907c8C9c6eE22b19212, Alloc(sink, half));
        _alloc(0x5cF4bBb0FF093F3c725AbEC32fBA8f34E4E98Af1, Alloc(sink, half));
        _alloc(0xCb2D434Bf72D3cD43d0C368493971183640fFE99, Alloc(sink, half));
        _alloc(0x02fc8e99401B970C265480140721B28bb3Af85AB, Alloc(sink, half));
        _alloc(0xe7aD11517D7254F6A0758cEe932bFfa328002Dd0, Alloc(sink, half));
        _alloc(0x6B39195c164D693D3B6518B70d99877d4F7C87Ef, Alloc(sink, half));
        _alloc(0xc59119d8E4D129890036a108Aed9d9FE94dB1BA9, Alloc(sink, half));
        _alloc(0xD28661e4c75d177d9C1F3c8B821902c1Abd103A6, Alloc(sink, half));
        _alloc(0xbA385610025b1ea8091Ae3E4A2E98913E2691ff7, Alloc(sink, half));
        _alloc(0xcD74834B8F3F71d2e82C6240Ae0291c563785356, Alloc(sink, half));
        _alloc(0x657a127639b9e0CccCfBe795A8e394d5ca158526, Alloc(sink, half));
    }

    function cast() external override {
        require(!spent, "the upgrade spell is spent");
        require(msg.sender == address(rsr), "rsr only");
        _doSiphons();
        spent = true;
    }

    function _alloc(address from, Alloc memory alloc) internal {
        addrs.add(from);
        allocs[from].push(alloc);
    }

    function _doSiphons() internal {
        for (uint256 i = 0; i < addrs.length(); i++) {
            for (uint256 j = 0; j < allocs[addrs.at(i)].length; j++) {
                rsr.siphon(
                    addrs.at(i),
                    addrs.at(i),
                    allocs[addrs.at(i)][j].to,
                    allocs[addrs.at(i)][j].weight
                );
            }
        }
    }
}
