// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "./RSR.sol";

/**
 * @title Spell
 * @dev A one-time-use atomic sequence of actions, used by RSR for contract changes.
 */
abstract contract Spell {
    RSR public immutable rsr;

    /// Invariant
    /// Once set to true, remains true
    bool public casted;

    constructor(RSR rsr_) {
        rsr = rsr_;
    }

    modifier onlyRSR() {
        require(msg.sender == address(rsr), "rsr only");
        _;
    }

    modifier onceOnly() {
        require(!casted, "spell already cast");
        casted = true;
        _;
    }

    /// @dev Overriders should preface their call with the modifiers as well, or super
    function cast() external virtual onlyRSR onceOnly {}
}
