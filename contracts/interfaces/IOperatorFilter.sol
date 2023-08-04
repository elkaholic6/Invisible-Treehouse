// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IOperatorFilter {

    function isAllowedOperator(address operator) external returns (bool);

    function addAllowedOperator(address operator) external;

    function removeAllowedOperator(address operator) external;
}