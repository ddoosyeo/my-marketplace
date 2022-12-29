// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '../token/Custom1155.sol';
import './IFactoryOf1155.sol';

contract FactoryOf1155 is IFactoryOf1155 {
  function create1155Token(
    string calldata baseTokenURI,
    string calldata contractURI,
    address creator,
    address minter,
    address admin
  ) external returns (address) {
    Custom1155 custom1155 = new Custom1155(
      baseTokenURI,
      contractURI,
      creator,
      minter,
      admin
    );

    return address(custom1155);
  }
}
