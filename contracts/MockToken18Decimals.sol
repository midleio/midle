// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "hardhat/console.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MTK18 is ERC20 {
    constructor() ERC20("MTK18", "MTK18") {
        uint256 _amt = 100000000 * (10**18);

        /*
                 console.log(
                    "PeriodsPassed : %s nextPeriodCount :  %s nextTotalAmount : %s",
                    periodsPassed,
                    nextPeriodCount,
                    nextTotalAmount
                );
                console.log(
                    "TimestampNow : %s tgeTimeStamp :  %s TgeTokenAmount : %s",
                    _timestamp,
                    tgeTimestamp,
                    tgeTokenAmount
                );
        */

        _mint(msg.sender, _amt);
    }

}
