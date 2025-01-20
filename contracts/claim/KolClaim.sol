// SPDX-License-Identifier: MIT
/*  
@author : Baris Arya Cantepe        
*/
pragma solidity ^0.8.17;

import {MidleBaseClaim} from "./MidleBaseClaim.sol";

/// @title KolClaim
/// @dev Implements a token vesting mechanism where tokens are locked and released linearly over time.
/// @notice This contract is used to manage the vesting of tokens, allowing users to claim their vested tokens over a period.
contract KolClaim is MidleBaseClaim {

    /// @notice Constructor to initialize. Total claim amount is 6,666,667 MIDLE.
    /// @dev The constructor takes MIDLE contract address and TGE.
    /// TGE release rate is based 10,000, release rate is based 21,600,000,000.
    /// @param _midleAddress Address of the MIDLE token contract
    /// @param _tgeTimestamp TGE timestamp of the associated Vesting contract
    constructor(address _midleAddress, uint256 _tgeTimestamp )

        MidleBaseClaim(_midleAddress, 
        _tgeTimestamp,
        1000,
        1,
        120000000,
        6666667 * 10 ** 18
        ) {}

    
}
