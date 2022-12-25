// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IFactoryOf721 {
  function create721Token(
    string memory, 
    string memory, 
    string memory, 
    string memory, 
    address, 
    address, 
    address
  ) external returns (address);
}