// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IOldRSR.sol";
import "./Errors.sol";

/*
 * @title RSR
 * @dev An ERC20 insurance token for the Reserve Protocol ecosystem.
 * Migration plan from old RSR:
 *  1. Load a balance for an account exactly once.
 *  2. Only load a balance if the old RSR is paused.
 *  3. Ensure old RSR can never be unpaused.
 */
contract RSR is Ownable, ERC20Permit {
    /// ==== Immutable ====

    IOldRSR public immutable oldRSR;
    uint256 public immutable fixedSupply;
    uint256 public constant NORM = 1e3;

    /// ==== Mutable ====

    /// OldRSR.address -> RSR.address: Fraction of 1e3 of old balance that should be forwarded
    mapping(address => mapping(address => uint256)) public splits;

    /// if reverseSplits[addr].length == 0: the crossover from old RSR is the identity
    mapping(address => address[]) reverseSplits;

    mapping(address => bool) public crossed;

    /// Gas optimization: Cached view of old RSR pause state
    bool private _oldRSRPaused;

    constructor(address prevRSR_) ERC20("Reserve Rights", "RSR") ERC20Permit("Reserve Rights") {
        oldRSR = IOldRSR(prevRSR_);
        fixedSupply = IOldRSR(prevRSR_).totalSupply();
        _oldRSRPaused = IOldRSR(prevRSR_).paused();
    }

    modifier ensureCrossed(address account) {
        if (!_oldRSRPaused) {
            if (!oldRSR.paused()) {
                revert Errors.OldRSRUnpaused();
            }
            _oldRSRPaused = true;
        }
        if (!crossed[account]) {
            _cross(account);
        }
        _;
    }

    // ========================= Owner =========================
    // Note: The owner should be set to the zero address by the time the old RSR is paused

    /// Moves `split` from `old`->`prev` to `old`->`to`
    /// @param old The address that has the balance on OldRSR
    /// @param prev The receiving address to siphon tokens away from
    /// @param to The receiving address to siphon tokens towards
    /// @param split A uint between 0 and the current `old`->`prev` split
    function siphon(
        address old,
        address prev,
        address to,
        uint256 split
    ) external onlyOwner {
        if (reverseSplits[prev].length == 0) {
            reverseSplits[prev].push(old);
        }

        require(split <= splits[old][prev], "split too big");
        splits[old][prev] -= split;
        splits[old][to] += split;
        reverseSplits[to].push(old);
    }

    /// Fill zero-addressed dust balances that were lost during migration
    function changeBalanceAtZeroAddress(int256 amount) external onlyOwner {
        if (amount > 0) {
            _mint(address(0), uint256(amount));
        } else if (amount < 0) {
            _burn(address(0), uint256(-amount));
        }
    }

    /// Escape hatch for on-chain hygiene
    function destroy() external onlyOwner {
        selfdestruct(payable(owner()));
    }

    // ========================= External =============================

    /// A light wrapper for ERC20 transfer that crosses the account over if necessary.
    function transfer(address recipient, uint256 amount)
        public
        override
        ensureCrossed(_msgSender())
        returns (bool)
    {
        return super.transfer(recipient, amount);
    }

    /// A light wrapper for ERC20 transferFrom that crosses the account over if necessary.
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override ensureCrossed(sender) returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    /// @return The fixed total supply of the token.
    function totalSupply() public view override returns (uint256) {
        return fixedSupply;
    }

    /// The balance is a combination of crossing + newly received tokens
    function balanceOf(address account) public view override returns (uint256) {
        uint256 start = crossed[account] ? 0 : _initialBalance(account);
        return start + super.balanceOf(payable(account));
    }

    // ========================= Internal =============================

    /// Use the hook for the internal ERC20 internal _transfer function to prevent accidental sends to the contract.
    function _beforeTokenTransfer(
        address,
        address to,
        uint256
    ) internal view override {
        if (to == address(this)) {
            revert Errors.TransferToContractAddress();
        }
    }

    /// Implements a one-time crossover from the old RSR, per account.
    function _cross(address account) internal {
        crossed[account] = true;
        _mint(account, _initialBalance(account));
    }

    /// @return sum The initial balance for an account after crossing
    function _initialBalance(address account) internal view returns (uint256 sum) {
        sum = oldRSR.balanceOf(account);
        for (uint256 i = 0; i < reverseSplits[account].length; i++) {
            // Note that there is an acceptable loss of precision equal to ~1e3 RSR quanta
            address from = reverseSplits[account][i];
            sum += (oldRSR.balanceOf(from) * splits[from][account]) / 1e3;
        }
    }
}
