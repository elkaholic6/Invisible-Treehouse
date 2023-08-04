// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./interfaces/ITreasury.sol";


contract Treasury is ITreasury {
    address public owner = 0xD44cFE94A46856806c45676DD7543cD8C01dcb29;

    receive() external payable {
        emit PlatformFundsReceived(msg.sender, msg.value);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
    }
}