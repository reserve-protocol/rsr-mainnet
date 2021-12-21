// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./Spell.sol";

interface IPausable {
    function pause() external;
}

/*
 * @title UpgradeSpell
 * @dev A one-time-use series of commands to finalize the upgrade to RSR.
 *
 * This contract must be the pauser of `oldRSR` and regent of `rsr`
 */
contract UpgradeSpell is Spell {
    IPausable public immutable oldRSR;

    constructor(IPausable oldRSR_, RSR rsr_) Spell(rsr_) {
        oldRSR = oldRSR_;
    }

    function cast() external override onlyRSR onceOnly {
        oldRSR.pause();
        rsr.renounceOwnership();
        rsr.unpause();
    }
}
