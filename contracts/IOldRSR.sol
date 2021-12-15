// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

interface IOldRSR {
    function paused() external view returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);
}
