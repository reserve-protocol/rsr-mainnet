// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RSR.sol";
import "./ISpell.sol";

interface IPausable {
    function pause() external;
}

/*
 * @title UpgradeSpell
 * @dev A one-time-use series of commands to finalize the upgrade to RSR.
 *
 * This contract must be the pauser of `oldRSR` and regent of `rsr`
 */
contract UpgradeSpell is ISpell {
    IPausable public immutable oldRSR;
    RSR public immutable rsr;

    /// Invariant
    /// Once set to true, remains true
    bool public spent;

    constructor(IPausable oldRSR_, RSR rsr_) {
        oldRSR = oldRSR_;
        rsr = rsr_;
    }

    function cast() external override {
        require(!spent, "the upgrade spell is spent");
        require(msg.sender == address(rsr), "rsr only");

        spent = true;
        oldRSR.pause();
        rsr.renounceOwnership();
    }
}
