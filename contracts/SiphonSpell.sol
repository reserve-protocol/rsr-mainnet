// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./Spell.sol";

/**
 * @title SiphonSpell
 * @dev A one-time-use atomic series of siphon actions, castable via a Mage
 */
contract SiphonSpell is Spell {
    /// An allocation of weight to be siphoned
    struct Siphon {
        address from;
        address to;
        uint64 weight; // 0 to MAX_WEIGHT==1e18
    }

    Siphon[] public siphons;

    /// We expect the number of siphons we need to create to fit into this array.
    /// If you need to make more siphons than will fit, use multiple SiphonSpells.
    constructor(address rsr_, Siphon[] memory siphons_) Spell(rsr_) {
        for (uint256 i = 0; i < siphons_.length; i++) {
            siphons.push(siphons_[i]);
        }
    }

    /// Cast the saved siphons
    function spell() internal override {
        for (uint256 i = 0; i < siphons.length; i++) {
            Siphon storage s = siphons[i];
            RSR(rsrAddr).siphon(s.from, s.from, s.to, s.weight);
        }
    }
}
