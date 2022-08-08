// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./EasyAuction.sol";

contract EasyAuctionCaller {
    constructor() {}

    function initiateAuction(
        IEasyAuction easyAuction,
        IERC20 sellToken,
        IERC20 buyToken
    ) external {
        uint96 sellAmt = 1e24;
        require(sellToken.balanceOf(address(this)) > sellAmt, "no balance");
        sellToken.approve(address(easyAuction), sellAmt);
        easyAuction.initiateAuction(
            sellToken,
            buyToken,
            block.timestamp + 14400,
            block.timestamp + 14400,
            sellAmt,
            1e18,
            1,
            0,
            false,
            address(0),
            new bytes(0)
        );
    }
}
