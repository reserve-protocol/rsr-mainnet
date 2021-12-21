// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "./RSR.sol";

/**
 * @title Spell
 * @dev A one-time-use atomic sequence of actions, hasBeenCast by RSR for contract changes.
 */
abstract contract Spell {
    RSR public immutable rsr;

    bool public hasBeenCast;

    constructor(RSR rsr_) {
        rsr = rsr_;
    }

    function cast() external {
        require(msg.sender == address(rsr), "rsr only");
        require(!hasBeenCast, "spell already cast");
        hasBeenCast = true;
        spell();
    }

    /// A derived Spell overrides spell() to enact its intended effects.
    function spell() internal virtual;
}
