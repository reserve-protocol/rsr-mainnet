// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./Spell.sol";

interface IPausable {
    function pause() external;
}

/**
 * @title ForkSpell
 * @dev A one-time-use series of commands to finalize the fork to upgraded RSR.
 *
 * This contract must be the pauser of `oldRSR` and mage of `rsr`
 */
contract ForkSpell is Spell {
    IPausable public immutable oldRSR;

    constructor(IPausable oldRSR_, address rsr_) Spell(rsr_) {
        oldRSR = oldRSR_;
    }

    /// Pause old RSR, renounce ownership, + unpause new RSR
    function spell() internal override {
        oldRSR.pause();
        RSR(rsrAddr).moveToWorking();
    }
}
