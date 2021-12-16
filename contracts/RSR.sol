// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IOldRSR.sol";

/*
 * @title RSR
 * @dev An ERC20 insurance token for the Reserve Protocol ecosystem.
 */
contract RSR is Ownable, ERC20Permit {
    using EnumerableSet for EnumerableSet.AddressSet;

    IOldRSR public immutable oldRSR;
    uint16 public constant WEIGHT_ONE = 1e3;
    /// A uint16 value `w` is a _weight_, and it represents the fractional value `w / WEIGHT_ONE`.
    uint256 private immutable fixedSupply;

    /** @dev
    Relative Immutability
    =====================

    We assume that, once OldRSR is paused, its paused status, balances, and allowances
    are immutable.

    After OldRSR is paused, that contract's values for hasWeights, weights, and origins
    are immutable.

    Before OldRSR is paused, the booleans in balCrossed and allownceCrossed are all
    false. After OldRSR is paused, the entries in those maps can change only from false
    to true.
    */

    /// Invariant: For all addresses A,
    /// if !hasWeights[A], then for all B, weights[A][B] == 0
    /// if hasWeights[A], then sum_{all addresses B} (weights[A][B]) == WEIGHT_ONE
    ///
    /// hasWeights: map(OldRSR addr -> bool)
    /// If !hasWeights[A], then A's balances should be forwarded as by default.
    /// If hasWeights[A], then A's balances should be forwarded as by weights[A][_]
    mapping(address => bool) public hasWeights;

    /// weights: map(OldRSR addr -> RSR addr -> uint16 weight)
    /// weights[A][B] is the fraction of A's old balance that should be forwarded to B.
    ///
    /// (Again, with the caveat of hasWeights; if weights[A][B] == 0 for all B, then
    ///  hasWeights[A] = false, and A's old balance should just stay where it is!)
    mapping(address => mapping(address => uint16)) public weights;

    /// Invariant: For all A and B, if weights[A][B] > 0, then A is in origins[B]
    ///
    /// origins: map(RSR addr -> set(OldRSR addr))
    mapping(address => EnumerableSet.AddressSet) origins;

    /// balCrossed[A]: true iff we've already crossed oldRSR balances into this._balances[A]
    mapping(address => bool) public balCrossed;

    /// allowanceCrossed[A][B]: true iff we've already crossed the oldRSR allowance into
    ///   this._allowance[A][B].
    mapping(address => mapping(address => bool)) public allowanceCrossed;

    /** @dev A few mathematical functions, so we can be really precise here:

    totalWeight(A, B) = (hasWeights[A] ? weights[A][B] : ((A == B) ? WEIGHT_ONE : 0))
    inheritedBalance(A) = sum_{all addrs B} ( oldRSR.balanceOf(A) * totalWeight(A,B) / WEIGHT_ONE )

    Properties of balances:

    For all addresses A:
    - If OldRSR is not yet paused, balCrossed[A] is false.
    - Once balCrossed[A] is true, it stays true forever.
    - balanceOf(A) == this._balances[A] + (balCrossed[A} ? inheritedBalance(A) : 0)
    - balanceOf satisfies all the usual rules for ERC20 tokens.

    Properties of allowances:

    For all addresses A and B,
    - If OldRSR is not yet paused, then allowanceCrossed[A][B] is false
    - Once allowanceCrossed[A][B] == true, it stays true forever
    - allowance(A,B) == allowanceCrossed[A][B] ? this._allowance[A][B] : oldRSR.allowance(A,B)
    - allowance satisfies all the usual rules for ERC20 tokens.
    */

    constructor(address prevRSR_) ERC20("Reserve Rights", "RSR") ERC20Permit("Reserve Rights") {
        oldRSR = IOldRSR(prevRSR_);
        fixedSupply = IOldRSR(prevRSR_).totalSupply();
    }

    modifier onlyAfterPause() {
        require(oldRSR.paused(), "waiting for oldRSR to pause");
        require(owner() == address(0), "owner must be set to zero");
        _;
    }

    modifier notToThis(address to) {
        require(to != address(this), "no transfers to this token address");
        _;
    }

    modifier ensureBalCrossed(address from) {
        if (!balCrossed[from]) {
            balCrossed[from] = true;
            _mint(from, _oldBal(from));
        }
        _;
    }

    modifier ensureAllowanceCrossed(address from, address to) {
        if (!allowanceCrossed[from][to]) {
            allowanceCrossed[from][to] = true;
            _approve(from, to, oldRSR.allowance(from, to));
        }
        _;
    }

    // ========================= Admin =========================
    // Note: The owner should be set to the zero address by the time the old RSR is paused

    /// Moves `weight` from `old`->`prev` to `old`->`to`
    /// @param old The address that has the balance on OldRSR
    /// @param prev The receiving address to siphon tokens away from
    /// @param to The receiving address to siphon tokens towards
    /// @param weight A uint between 0 and the current `old`->`prev` weight, maximum 1000 (WEIGHT_ONE)
    function siphon(
        address old,
        address prev,
        address to,
        uint16 weight
    ) external onlyOwner {
        require(!oldRSR.paused(), "old RSR is already paused");
        _siphon(old, prev, to, weight);
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

    // ========================= After Old RSR is Paused =============================

    function transfer(address recipient, uint256 amount)
        public
        override
        onlyAfterPause
        notToThis(recipient)
        ensureBalCrossed(_msgSender())
        returns (bool)
    {
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    )
        public
        override
        onlyAfterPause
        notToThis(recipient)
        ensureBalCrossed(sender)
        ensureAllowanceCrossed(sender, recipient)
        returns (bool)
    {
        return super.transferFrom(sender, recipient, amount);
    }

    function approve(address spender, uint256 amount)
        public
        override
        onlyAfterPause
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        allowanceCrossed[_msgSender()][spender] = true;
        return true;
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override onlyAfterPause {
        super.permit(owner, spender, value, deadline, v, r, s);
        allowanceCrossed[_msgSender()][spender] = true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        override
        onlyAfterPause
        ensureAllowanceCrossed(_msgSender(), spender)
        returns (bool)
    {
        return super.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subbedValue)
        public
        override
        onlyAfterPause
        ensureAllowanceCrossed(_msgSender(), spender)
        returns (bool)
    {
        return super.decreaseAllowance(spender, subbedValue);
    }

    /// @return The fixed total supply of the token
    function totalSupply() public view override returns (uint256) {
        return fixedSupply;
    }

    /// The balance is a combination of crossing + newly received tokens
    function balanceOf(address account) public view override returns (uint256) {
        if (balCrossed[account]) {
            return super.balanceOf(account);
        }
        return _oldBal(account) + super.balanceOf(account);
    }

    /// The allowance is a combination of crossing allowance + newly granted allowances
    function allowance(address owner, address spender) public view override returns (uint256) {
        if (allowanceCrossed[owner][spender]) {
            return super.allowance(owner, spender);
        }
        return oldRSR.allowance(owner, spender);
    }

    // ========================= Internal =============================

    /// Moves `weight` from `old`->`prev` to `old`->`to`
    /// @param old The address that has the balance on OldRSR
    /// @param prev The receiving address to siphon tokens away from
    /// @param to The receiving address to siphon tokens towards
    /// @param weight A uint between 0 and the current `old`->`prev` weight, maximum 1000 (WEIGHT_ONE)
    function _siphon(
        address old,
        address prev,
        address to,
        uint16 weight
    ) internal {
        if (!hasWeights[old]) {
            origins[old].add(old);
            weights[old][old] = WEIGHT_ONE;
            hasWeights[old] = true;
        }

        require(weight <= weights[old][prev], "weight too big");
        weights[old][prev] -= weight;
        weights[old][to] += weight;
        origins[to].add(old);
    }

    /// @return sum The starting balance for an account after crossing from old RSR
    function _oldBal(address account) internal view returns (uint256 sum) {
        if (!hasWeights[account]) {
            sum = oldRSR.balanceOf(account);
        }
        for (uint256 i = 0; i < origins[account].length(); i++) {
            // Note that there is an acceptable loss of precision equal to ~1e3 RSR quanta
            address from = origins[account].at(i);
            sum += (oldRSR.balanceOf(from) * weights[from][account]) / 1e3;
        }
    }
}
