// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./Spell.sol";

// TODO: Include in scripts
// uint64 half = rsr_.WEIGHT_ONE() / 2;

// ...more, and probably most accounts will have 2 outgoing edges rather than 1
// Add siphons here. Right now it's just 50% for everyone to show what it looks like.

/*
 * @title SiphonSpell
 * @dev A one-time-use atomic series of siphon actions, castable via RSR.castSpell()
 */
contract SiphonSpell is Spell {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// An allocation of weight that is to be siphoned
    struct Siphon {
        address from;
        address to;
        uint64 weight; // 0 to MAX_WEIGHT
    }

    Siphon[] public siphons;

    constructor(RSR rsr_, Siphon[] memory siphons_) Spell(rsr_) {
        for (uint256 i = 0; i < siphons_.length; i++) {
            siphons.push(siphons_[i]);
        }
    }

    function cast() external override onlyRSR onceOnly {
        for (uint256 i = 0; i < siphons.length; i++) {
            Siphon storage s = siphons[i];
            rsr.siphon(s.from, s.from, s.to, s.weight);
        }
    }
}
