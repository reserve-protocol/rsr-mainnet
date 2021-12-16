// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity ^0.4.24;

import "./OldRSR.sol";

contract ReserveRightsTokenMock is ReserveRightsToken {
    constructor(address previousContract) ReserveRightsToken(previousContract, address(1)) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
