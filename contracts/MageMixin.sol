// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ISpell {
    function cast() external;
}

/**
 * @title MageMixin
 * @dev A very simple mixin that enables the regent spell-casting pattern.
 */
abstract contract MageMixin is Ownable {
    /// The regent pattern
    address private _regent;

    event RegentChanged(address oldRegent, address newRegent);

    modifier onlyAdmin() {
        require(_msgSender() == _regent || _msgSender() == owner(), "only regent or owner");
        _;
    }

    function regent() public view returns (address) {
        return _regent;
    }

    /// Grants regent to an Spell, casts the spell, and restore regent
    function castSpell(ISpell spell) external onlyOwner {
        _grantRegent(address(spell));
        spell.cast();
        _grantRegent(address(0));
    }

    function _grantRegent(address regent_) private {
        emit RegentChanged(_regent, regent_);
        _regent = regent_;
    }
}
