// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IOwnable.sol";

abstract contract Ownable is IOwnable {
    /**
     *  @dev Owner of the contract (purpose: OpenSea compatibility)
     */
    address private _owner;

    mapping(address => mapping(address => bool)) private _isApproved;

    constructor() {
        _owner = msg.sender;
    }

    /**
     * @dev Reverts if caller is not the owner.
     */ 
    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert("Ownable: Not authorized");
        }
        _;
    }

    /**
     *  @notice Returns the owner of the contract.
     */
    function owner() public view override returns (address) {
        return _owner;
    }

    /**
     *  @notice Lets an authorized wallet set a new owner for the contract.
     * 
     *  @param _newOwner The address to set as the new owner of the contract.
     */
    function setOwner(address _newOwner, address oldOwner, address operator) external override {
        if (!isApproved(oldOwner, operator)) {
            revert("Ownable: Not authorized to set owner");
        }
        _setupOwner(_newOwner);
    }

    /**
     * @notice Sets an authorized account to set a new owner for the Ownable contract.
     * 
     * @param operator The address of the operator
     * @param approved Whether or not the operator is allowed to set the owner of the NFT
     */
    function setApproval(address operator, bool approved) public virtual override {
        _setApproval(msg.sender, operator, approved);
    }

    /**
     * @notice Checks if `operator` is allowed to transfer the caller's tokens on the Ownable contract.
     * 
     * @param account The address of the current contract owner
     * @param operator The address of the operator
     */
    function isApproved(address account, address operator) public view virtual override returns (bool) {
        return _isApproved[account][operator];
    }

    /**
     * @dev Lets a contract admin set a new owner for the contract. The new owner must be a contract admin.
    */ 
    function _setupOwner(address _newOwner) internal {
        address _prevOwner = _owner;
        _owner = _newOwner;

        emit OwnerUpdated(_prevOwner, _newOwner);
    }

    /**
     * @notice Internal function to set an authorized account to set a new owner for the Ownable contract.
     * 
     * @param contractOwner The address of the contract owner
     * @param operator The address of the operator
     * @param approved Whether or not the operator is allowed to set the owner of the NFT
     */
    function _setApproval(address contractOwner, address operator, bool approved) internal virtual {
        require(contractOwner != operator, "Ownable: setting approval status for self");
        _isApproved[contractOwner][operator] = approved;
    }
}