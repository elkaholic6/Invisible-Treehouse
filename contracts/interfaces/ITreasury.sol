// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ITreasury {

    /**
     * @notice Event that emits the information of the platform funds received
     * 
     * @param _msgSender The address of the sender(will be marketplace contract address...probably)
     * @param _msgValue The amount of ether sent
     */
    event PlatformFundsReceived(
        address indexed _msgSender, 
        uint256 indexed _msgValue
    );
}