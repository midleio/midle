// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title MidleBaseVesting
/// @dev Manages token vesting with linear release after a cliff, utilizing events and errors for state changes and conditions.
/// @notice Allows to lock tokens and claim them based on a predefined vesting schedule after a cliff period post-TGE.
contract MidleBaseVesting is ReentrancyGuard {

    uint40 public releaseRate;
    uint16 public tgeRate;
    uint256 public lockStartTime;
    uint256 public tgeTimestamp;
    uint256 public totalLocked;
    uint16 constant tgeBaseRate = 10000;
    uint40 constant baseRate = 21600000000; // 720 * 30 * 1,000,000
    uint256 public constant period = 1 days;
    address public immutable midleTokenAddress;
    uint256 public immutable maxTokensToLock ; 

    mapping(address => LockInfo) public userToLockInfo;

    event ReleaseInfoSet(uint256 startTime, uint256 rate, uint256 tgeRate);
    event Claimed(address indexed user, uint256 timestamp, uint256 claimedAmount, 
    uint256 totalClaimed, uint256 totalAmount);
    event TokensLocked(address indexed user, uint256 timestamp, uint256 amount);

    error NothingToClaim();

    struct LockInfo {
        uint256 totalAmount;
        uint256 totalClaimed;
    }

    constructor(
        address _midleAddress, 
        uint256 _tgeTimestamp, 
        uint16 _tgeRate, 
        uint256 _cliff, 
        uint40 _rate, 
        uint256 _vestingSupply 
    ) {

        require (_midleAddress != address(0) , "Invalid address") ;
        midleTokenAddress = _midleAddress;

        tgeTimestamp = _tgeTimestamp;
        lockStartTime = _tgeTimestamp + (_cliff * 30 days) - period;

        maxTokensToLock = _vestingSupply;
        setReleaseInfo(_rate, _tgeRate);
    }

    function setReleaseInfo( uint40 _rate,  uint16 _tgeRate) internal {
        require(_rate > 0 , "Value must be greater than zero.");
        releaseRate = _rate;
        tgeRate = _tgeRate;
        emit ReleaseInfoSet(lockStartTime, _rate, _tgeRate);
    }

    function lockTokens(address _user, uint256 _amt) internal { 
        require(_user != address(0), "Invalid address.");
        require(_amt != 0 , "Invalid amount.");
        LockInfo storage info = userToLockInfo[_user];
        info.totalAmount += _amt;
        totalLocked += _amt;
        require(totalLocked <= maxTokensToLock , "Vesting supply reached.");
        emit TokensLocked(_user, block.timestamp,_amt);
    }

    function getClaimable(address _user) public view returns (uint256) {
        LockInfo memory info = userToLockInfo[_user];
        if (info.totalClaimed == info.totalAmount || lockStartTime == 0 ) {
            return 0;
        }
        uint256 totalClaimableSoFar;
        uint256 tgeTokenAmount = info.totalAmount * tgeRate / tgeBaseRate;
        
        if ( block.timestamp < lockStartTime) {
            totalClaimableSoFar =  tgeTokenAmount;
        } else {
            uint256 timePassed = block.timestamp - lockStartTime;
            uint256 periodsPassed = timePassed / period;

            totalClaimableSoFar = ((info.totalAmount - tgeTokenAmount) * periodsPassed * releaseRate / baseRate) 
            + tgeTokenAmount;
        }

        if (totalClaimableSoFar > info.totalAmount) {
            totalClaimableSoFar = info.totalAmount;
        }
        return totalClaimableSoFar - info.totalClaimed;
    }

    function claim() external nonReentrant {
        uint256 claimable = getClaimable(msg.sender);
        if (claimable == 0 || block.timestamp < tgeTimestamp ) {
            revert NothingToClaim();
        }
        LockInfo storage info = userToLockInfo[msg.sender];
        info.totalClaimed = info.totalClaimed + claimable;
        IERC20 midle = IERC20(midleTokenAddress);
        midle.transfer(msg.sender, claimable);
        emit Claimed(msg.sender, block.timestamp, claimable, info.totalClaimed, info.totalAmount);
    }
    
    function getNextVestingInfo (address _user) public view returns(uint256 nextVestingTime, 
    uint256 nextTotalVestingAmount, uint256 totalAmount, uint256 claimedSoFar, uint256 claimableAmountNow) {

        require(_user != address(0), "Wrong address");

        LockInfo memory info = userToLockInfo[_user];
        uint256 tgeTokenAmount = info.totalAmount * tgeRate / tgeBaseRate;
        uint256 _timestamp = block.timestamp;

        if (info.totalAmount > 0) {
            if (_timestamp < tgeTimestamp ) {
                return (tgeTimestamp, tgeTokenAmount, info.totalAmount, info.totalClaimed, 0);
            } else {
                uint256 claimable = getClaimable(_user);
                uint256 timePassed;

                _timestamp < lockStartTime ? timePassed = 0 : 
                timePassed = _timestamp - lockStartTime;

                uint256 periodsPassed = timePassed / period;
                uint256 nextPeriodCount = periodsPassed + 1;
                uint256 nextVestingTimestamp = lockStartTime + (nextPeriodCount * period);
                uint256 nextTotalAmount = ((info.totalAmount - tgeTokenAmount) * nextPeriodCount * releaseRate / baseRate) 
                + tgeTokenAmount;
                
                return (nextVestingTimestamp, nextTotalAmount , info.totalAmount, info.totalClaimed, claimable) ;
            }
        } else {
            return (0, 0, 0, 0, 0) ;
        }
    }

}
