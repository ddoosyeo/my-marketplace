// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IFactoryOf721 {
  function create1155Token(
    string memory, 
    string memory,
    address, 
    address, 
    address
  ) external returns (address);
}