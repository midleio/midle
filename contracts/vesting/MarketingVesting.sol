// SPDX-License-Identifier: MIT
/*  
@author : Baris Arya Cantepe        
*/
pragma solidity ^0.8.17;

import {MidleBaseVesting} from "./MidleBaseVesting.sol";

/// @title MarketingVesting
/// @dev Implements a token vesting mechanism where tokens are locked and released linearly over time.
/// @notice This contract is used to manage the vesting of tokens, allowing users to claim their vested tokens over a period.
contract MarketingVesting is MidleBaseVesting {

    /// @notice Constructor to initialize. MarketingVesting total amount is 50,000,000 MIDLE.
    /// @dev The constructor takes MIDLE contract address, TGE and the locking address. 
    /// TGE release rate is based 10,000, release rate is based 21,600,000,000.
    /// @param _midleAddress Address of the MIDLE token contract
    /// @param _tgeTimestamp TGE timestamp of the associated Vesting contract
    constructor(address _midleAddress, uint256 _tgeTimestamp )

        MidleBaseVesting(_midleAddress, 
        _tgeTimestamp,
        0,
        6,
        20000000,
        50000000 * 10 ** 18
        ) {

        lockTokens(0xB871989554b35F0F3D4406b839DF63EA88C7757E , 
        50000000 * 10 ** 18 ); // 50,000,000 $MIDLE
    }
}
