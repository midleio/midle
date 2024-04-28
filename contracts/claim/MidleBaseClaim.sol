// SPDX-License-Identifier: MIT
/*  
@author : Baris Arya Cantepe        
*/
pragma solidity ^0.8.17;

import {MidleBaseVesting} from "../vesting/MidleBaseVesting.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MidleBaseClaim
/// @dev Implements a token vesting mechanism where tokens are locked and released linearly over time.
/// @notice This contract is used to manage the vesting of tokens, allowing users to claim their vested tokens over a period.
contract MidleBaseClaim is MidleBaseVesting, Ownable {

    /// @notice Constructor to initialize. 
    /// @dev The constructor takes MIDLE contract address and TGE.
    /// TGE release rate is based 10,000, release rate is based 21,600,000,000.
    /// @param _midleAddress Address of the MIDLE token contract
    /// @param _tgeTimestamp TGE timestamp of the associated Vesting contract
    constructor(
        address _midleAddress, 
        uint256 _tgeTimestamp, 
        uint16 _tgeRate, 
        uint256 _cliff, 
        uint40 _rate, 
        uint256 _vestingSupply 
    ) 

    MidleBaseVesting(_midleAddress, 
    _tgeTimestamp,
    _tgeRate,
    _cliff,
    _rate,
    _vestingSupply
    ) {}

    /// @notice Locks a specified amount of tokens for vesting for a given user
    /// @param _user Address of the user whose tokens are to be locked
    /// @param _amt Amount of tokens to lock for vesting
    function lockToUser(address _user, uint256 _amt) external onlyOwner {
        lockTokens(_user, _amt);
    }

    /// @notice Locks a specified amount of tokens for vesting for users.
    /// @param _users Address array of the users whose tokens are to be locked
    /// @param _amts Amounts array of tokens to lock for vesting
    function lockTokensMultiple(address[] calldata _users, uint256[] calldata _amts) external onlyOwner {
        require(_users.length == _amts.length , "Arrays must have same length");

        for (uint256 i = 0; i < _users.length; i++) {
            lockTokens(_users[i], _amts[i]);
        }
    }
}
