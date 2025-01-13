// SPDX-License-Identifier: MIT
/*  
@author : Baris Arya Cantepe        
*/
pragma solidity ^0.8.17;

import {MidleBaseVesting} from "./MidleBaseVesting.sol";

/// @title CommunityRewardsVesting
/// @dev Implements a token vesting mechanism where tokens are locked and released linearly over time.
/// @notice This contract is used to manage the vesting of tokens, allowing users to claim their vested tokens over a period.
contract CommunityRewardsVesting is MidleBaseVesting {

    /// @notice Constructor to initialize. CommunityRewardsVesting total amount is 250,000,000 MIDLE.
    /// @dev The constructor takes MIDLE contract address, TGE and the locking address. 
    /// TGE release rate is based 10,000, release rate is based 21,600,000,000.
    /// @param _midleAddress Address of the MIDLE token contract
    /// @param _tgeTimestamp TGE timestamp of the associated Vesting contract
    constructor(address _midleAddress, uint256 _tgeTimestamp )

        MidleBaseVesting(_midleAddress, 
        _tgeTimestamp,
        0,
        1,
        12000000,
        250000000 * 10 ** 18
        ) {

        lockTokens(0x8cA38aC9C38C87896A8eFa65e6eacc9dbdCE78ec , 
        250000000 * 10 ** 18 ); // 250,000,000 $MIDLE
    }
}
