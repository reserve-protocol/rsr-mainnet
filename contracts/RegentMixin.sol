// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A very simple mixin to enable the regent upgrade pattern using spells.
 */
abstract contract RegentMixin is Ownable {
    address private _regent;

    event RegentChanged(address oldRegent, address newRegent);

    modifier onlyAdmin() {
        require(_msgSender() == _regent || _msgSender() == owner(), "only regent or owner");
        _;
    }

    function regent() public view returns (address) {
        return _regent;
    }

    function _grantRegent(address regent) internal {
        emit RegentChanged(_regent, regent);
        _regent = regent;
    }
}
