// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IFactoryOf721 {
  function create721Token(
    string calldata name, 
    string calldata symbol, 
    string calldata baseTokenURI, 
    string calldata contractURI, 
    address creator, 
    address minter, 
    address admin
  ) external returns (address);
}