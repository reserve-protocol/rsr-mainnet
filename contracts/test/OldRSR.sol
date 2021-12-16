/**
 * This file is a copy of the verified code for PreRSR.
 * It's important to use this code to mock old RSR because a lot has changed
 * about smart contract development since PreRSR was deployed. This code
 * should be used in all our unit tests.
 *
 *
 * Etherscan verified on 2019-05-17
 */

pragma solidity ^0.4.24;

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {
    /**
     * @dev Multiplies two numbers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
     * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0); // Solidity only automatically asserts when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two numbers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
     * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 * Originally based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract ERC20 is IERC20 {
    using SafeMath for uint256;

    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowed;

    uint256 private _totalSupply;

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }

    /**
     * @dev Transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        require(value <= _allowed[from][msg.sender]);

        _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = (_allowed[msg.sender][spender].add(addedValue));
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = (_allowed[msg.sender][spender].sub(subtractedValue));
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal {
        require(value <= _balances[from]);
        require(to != address(0));

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of balances such that the
     * proper events are emitted.
     * @param account The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address account, uint256 value) internal {
        require(account != 0);
        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address account, uint256 value) internal {
        require(account != 0);
        require(value <= _balances[account]);

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account, deducting from the sender's allowance for said account. Uses the
     * internal burn function.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burnFrom(address account, uint256 value) internal {
        require(value <= _allowed[account][msg.sender]);

        // Should https://github.com/OpenZeppelin/zeppelin-solidity/issues/707 be accepted,
        // this function needs to emit an event with the updated approval.
        _allowed[account][msg.sender] = _allowed[account][msg.sender].sub(value);
        _burn(account, value);
    }
}

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    struct Role {
        mapping(address => bool) bearer;
    }

    /**
     * @dev give an account access to this role
     */
    function add(Role storage role, address account) internal {
        require(account != address(0));
        require(!has(role, account));

        role.bearer[account] = true;
    }

    /**
     * @dev remove an account's access to this role
     */
    function remove(Role storage role, address account) internal {
        require(account != address(0));
        require(has(role, account));

        role.bearer[account] = false;
    }

    /**
     * @dev check if an account has this role
     * @return bool
     */
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0));
        return role.bearer[account];
    }
}

contract PauserRole {
    using Roles for Roles.Role;

    event PauserAdded(address indexed account);
    event PauserRemoved(address indexed account);

    Roles.Role private pausers;

    constructor() internal {
        _addPauser(msg.sender);
    }

    modifier onlyPauser() {
        require(isPauser(msg.sender));
        _;
    }

    function isPauser(address account) public view returns (bool) {
        return pausers.has(account);
    }

    function addPauser(address account) public onlyPauser {
        _addPauser(account);
    }

    function renouncePauser() public {
        _removePauser(msg.sender);
    }

    function _addPauser(address account) internal {
        pausers.add(account);
        emit PauserAdded(account);
    }

    function _removePauser(address account) internal {
        pausers.remove(account);
        emit PauserRemoved(account);
    }
}

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is PauserRole {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() internal {
        _paused = false;
    }

    /**
     * @return true if the contract is paused, false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(_paused);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyPauser whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyPauser whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

/**
 * @title Pausable token
 * @dev ERC20 modified with pausable transfers.
 **/
contract ERC20Pausable is ERC20, Pausable {
    function transfer(address to, uint256 value) public whenNotPaused returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public whenNotPaused returns (bool) {
        return super.transferFrom(from, to, value);
    }

    function approve(address spender, uint256 value) public whenNotPaused returns (bool) {
        return super.approve(spender, value);
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        whenNotPaused
        returns (bool success)
    {
        return super.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        whenNotPaused
        returns (bool success)
    {
        return super.decreaseAllowance(spender, subtractedValue);
    }
}

contract ReserveRightsToken is ERC20Pausable {
    string public name = "Reserve Rights";
    string public symbol = "RSR";
    uint8 public decimals = 18;

    // Tokens belonging to Reserve team members and early investors are locked until network launch.
    mapping(address => bool) public reserveTeamMemberOrEarlyInvestor;
    event AccountLocked(address indexed lockedAccount);

    // Hard-coded addresses from the previous deployment, which should be locked and contain token allocations.
    address[] previousAddresses = [
        0x8AD9C8ebE26eAdAb9251B8fC36Cd06A1ec399a7F,
        0xb268c230720D16C69a61CBeE24731E3b2a3330A1,
        0x082705FaBF49BD30De8f0222821F6d940713b89D,
        0xc3Aa4cEd5DEa58A3d1cA76e507515c79cA1e4436,
        0x66F25f036eb4463d8A45C6594a325F9e89BAA6db,
        0x9e454Fe7d8e087fcac4ec8c40562dE781004477E,
        0x4fcc7cA22680aeD155F981EeB13089383D624aA9,
        0x5a66650e5345D76eb8136eA1490CbccE1c08072E,
        0x698a10B5D0972bFFEa306BA5950BD74D2aF3C7CA,
        0xDF437625216cCa3d7148E18d09F4aAB0D47c763b,
        0x24B4a6847cCb32972de40170C02FdA121DdC6a30,
        0x8D29A24F91DF381FEb4ee7F05405D3fB888c643e,
        0x5a7350d95b9e644dCAb4bC642707F43A361BF628,
        0xfC2E9A5CD1Bb9b3953fFA7e6Ddf0c0447Eb95f11,
        0x3aC7A6C3A2Ff08613b611485F795D07E785cBb95,
        0x47Fc47CbcC5217740905e16C4C953B2f247369D2,
        0xd282337950Ac6e936D0F0eBAaFf1Ffc3dE79F3d5,
        0xDE59cD3Aa43a2bF863723662B31906660C7D12b6,
        0x5f84660Cabb98F7b7764cD1AE2553442Da91984E,
        0xeFbAaF73FC22f70785515C1e2Be3d5ba2Fb8E9B0,
        0x63c5FFB388d83477a15Eb940cFa23991CA0b30F0,
        0x14f018CCe044f9d3Fb1e1644dB6f2FAb70F6e3cb,
        0xbE30069D27a250F90C2EE5507Bcaca5F868265f7,
        0xcFeF27288bEDcd587A1eD6E86a996C8C5B01D7c1,
        0x5f57BBccc7fFa4C46864B5ed999A271bc36bB0Ce,
        0xbaE85De9858375706ddE5907c8C9c6eE22b19212,
        0x5cF4bBb0FF093F3c725AbEC32fBA8f34E4E98Af1,
        0xCb2D434Bf72D3cD43d0C368493971183640fFE99,
        0x02fc8e99401B970C265480140721B28bb3Af85AB,
        0xe7aD11517D7254F6A0758cEe932bFfa328002Dd0,
        0x6B39195c164D693D3B6518B70d99877d4F7C87Ef,
        0xc59119d8E4D129890036a108Aed9d9FE94dB1BA9,
        0xD28661e4c75d177d9C1F3c8B821902c1Abd103A6,
        0xbA385610025b1ea8091Ae3E4A2E98913E2691ff7,
        0xcD74834B8F3F71d2e82C6240Ae0291c563785356,
        0x657a127639b9e0CccCfBe795A8e394d5ca158526
    ];

    constructor(address previousContract, address reservePrimaryWallet) public {
        IERC20 previousToken = IERC20(previousContract);

        _mint(reservePrimaryWallet, previousToken.balanceOf(reservePrimaryWallet));

        for (uint256 i = 0; i < previousAddresses.length; i++) {
            reserveTeamMemberOrEarlyInvestor[previousAddresses[i]] = true;
            _mint(previousAddresses[i], previousToken.balanceOf(previousAddresses[i]));
            emit AccountLocked(previousAddresses[i]);
        }
    }

    function transfer(address to, uint256 value) public returns (bool) {
        // Tokens belonging to Reserve team members and early investors are locked until network launch.
        require(!reserveTeamMemberOrEarlyInvestor[msg.sender]);
        return super.transfer(to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool) {
        // Tokens belonging to Reserve team members and early investors are locked until network launch.
        require(!reserveTeamMemberOrEarlyInvestor[from]);
        return super.transferFrom(from, to, value);
    }

    /// This function is intended to be used only by Reserve team members and investors.
    /// You can call it yourself, but you almost certainly don’t want to.
    /// Anyone who calls this function will cause their own tokens to be subject to
    /// a long lockup. Reserve team members and some investors do this to commit
    /// ourselves to not dumping tokens early. If you are not a Reserve team member
    /// or investor, you don’t need to limit yourself in this way.
    ///
    /// THIS FUNCTION LOCKS YOUR TOKENS. ONLY USE IT IF YOU KNOW WHAT YOU ARE DOING.
    function lockMyTokensForever(string consent) public returns (bool) {
        require(
            keccak256(abi.encodePacked(consent)) ==
                keccak256(
                    abi.encodePacked(
                        "I understand that I am locking my account forever, or at least until the next token upgrade."
                    )
                )
        );
        reserveTeamMemberOrEarlyInvestor[msg.sender] = true;
        emit AccountLocked(msg.sender);
    }
}
