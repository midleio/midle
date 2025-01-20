// SPDX-License-Identifier: MIT
/*  
@author : Baris Arya Cantepe        
*/
pragma solidity ^0.8.17;

import {MidleBaseClaim} from "./MidleBaseClaim.sol";

/// @title StrategicClaim
/// @dev Implements a token vesting mechanism where tokens are locked and released linearly over time.
/// @notice This contract is used to manage the vesting of tokens, allowing users to claim their vested tokens over a period.
contract StrategicClaim is MidleBaseClaim {

    /// @notice Constructor to initialize. Total claim amount is 3,000,000 MIDLE.
    /// @dev The constructor takes MIDLE contract address and TGE.
    /// TGE release rate is based 10,000, release rate is based 21,600,000,000.
    /// @param _midleAddress Address of the MIDLE token contract
    /// @param _tgeTimestamp TGE timestamp of the associated Vesting contract
    constructor(address _midleAddress, uint256 _tgeTimestamp )

        MidleBaseClaim(_midleAddress, 
        _tgeTimestamp,
        900,
        1,
        90000000,
        3000000 * 10 ** 18
        ) {}

    
}
