// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IOperatorFilter.sol";

abstract contract OperatorFilter is IOperatorFilter {

    /**
     * @notice Checks if `operator` is allowed to transfer the caller's tokens on the OperatorFilter contract.
     * 
     * @param operator The address of the operator
     */
    modifier onlyAllowedOperator(address operator) {
        require(isAllowedOperator(operator), "OperatorFilter: Operator not allowed");
        _;
    }

    /**
     * @notice Checks if `operator` is allowed to transfer the caller's tokens on the OperatorFilter contract.
     * @param operator The address of the operator to check
     */
    function isAllowedOperator(address operator) public view virtual override returns (bool);

    /**
     * @notice Allows `operator` to transfer the caller's tokens on the OperatorFilter contract.
     * @param operator The address of the operator to be allowed to transfer the caller's tokens
     */
    function addAllowedOperator(address operator) public virtual override;

    /**
     * @notice Removes `operator` from having the ability to transfer the caller's tokens on the OperatorFilter contract
     * @param operator The address of the operator to be removed fromt having the ability to transfer the caller's tokens
     */
    function removeAllowedOperator(address operator) public virtual override;
}