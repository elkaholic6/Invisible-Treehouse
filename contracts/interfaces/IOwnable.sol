// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IOwnable {
    /**
     * @dev Returns the owner of the contract.
     */
    function owner() external view returns (address);

    /**
     * @dev Lets a module admin set a new owner for the contract. The new owner must be a module admin.
     */
    function setOwner(address _newOwner, address oldOwner, address operator) external;

    /**
     * @notice Sets an authorized account to set a new owner for the Ownable contract.
     * 
     * @param operator The address of the operator
     * @param approved Whether or not the operator is allowed to set the owner of the NFT
     */
    function setApproval(address operator, bool approved) external;

    /**
     * @notice Checks if `operator` is allowed to transfer the caller's tokens on the Ownable contract.
     * 
     * @param account The address of the current contract owner
     * @param operator The address to check if approved
     */
    function isApproved(address account, address operator) external view returns (bool);

    /**
     * @dev @dev Emitted when a new Owner is set.
     */ 
    event OwnerUpdated(address indexed prevOwner, address indexed newOwner);
}