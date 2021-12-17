// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "contracts/SiphonSpell.sol";
import "contracts/RSR.sol";

contract SiphonSpellMock is SiphonSpell {
    constructor(RSR rsr_) SiphonSpell(rsr_) {}

    function planSiphon(address from, Siphon calldata s) external {
        _planSiphon(from, s);
    }
}
