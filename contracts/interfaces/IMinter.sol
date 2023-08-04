// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IMinter {
    /**
     * @notice Returns the total supply of NFTs.
     */
    function getMaxSupply() external view returns (uint256);

    /**
     * @notice Returns the owner of the contract.
     */
    function getOwner() external view returns (address);

    // function getTokenOwner(uint256 id) external view returns (address);

    function getTotalMinted(uint256 id) external view returns (uint256);
}