// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '../token/Custom721.sol';

contract FactoryOf721 {
  function create721Token(
    string calldata name,
    string calldata symbol,
    string calldata baseTokenURI,
    string calldata contractURI,
    address creator,
    address minter,
    address admin
  ) external returns (address) {
    Custom721 custom721 = new Custom721(
      name,
      symbol,
      baseTokenURI,
      contractURI,
      creator,
      minter,
      admin
    );

    return address(custom721);
  }
}