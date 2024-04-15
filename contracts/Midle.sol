// SPDX-License-Identifier: MIT
/*  
@author : Baris Arya Cantepe        
*/
pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Midle is ERC20, ERC20Permit {
    
    uint256 public constant MAX_SUPPLY = 1000000000 * 10 ** 18; 

    constructor() ERC20("MIDLE", "MDL") ERC20Permit("MIDLE") {
        _mint(msg.sender, MAX_SUPPLY);
    }

    function burn(uint256 value) external {
        _burn(msg.sender, value);
    }
}
