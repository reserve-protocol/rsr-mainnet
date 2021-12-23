// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "../RSR.sol";

contract RSRMock is RSR {
    constructor(address oldRSR_) RSR(oldRSR_) {}

    function oldBal(address account) external view returns (uint256) {
        return _oldBal(account);
    }

    function changePhase(Phase value) external  {
        phase = value;
    }
}
