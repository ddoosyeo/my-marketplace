// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IFactoryOf1155 {
  function create1155Token(
    string calldata baseTokenURI, 
    string calldata contractURI,
    address creator, 
    address minter, 
    address admin
  ) external returns (address);
}