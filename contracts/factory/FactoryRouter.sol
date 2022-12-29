// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import './interfaces/IFactoryOf721.sol';
import './interfaces/IFactoryOf1155.sol';
import './interfaces/IFactoryRouter.sol';

contract FactoryRouter is IFactoryRouter {
  address public _factoryOf721;
  address public _factoryOf1155;

  constructor(address factoryOf721, address factoryOf1155) {
    _factoryOf721 = factoryOf721;
    _factoryOf1155 = factoryOf1155;
  }

  function create721Token(
    string memory name,
    string memory symbol,
    string memory baseTokenURI,
    string memory contractURI,
    address creator,
    address minter,
    address admin
  ) external {
    address createdAddress = IFactoryOf721(_factoryOf721).create721Token(
      name,
      symbol,
      baseTokenURI,
      contractURI,
      creator,
      minter,
      admin
    );

    emit Create721Token(address(createdAddress), name, symbol);
  }

  function create1155Token(
    string memory baseTokenURI,
    string memory contractURI,
    address creator,
    address minter,
    address admin
  ) external {
    address createdAddress = IFactoryOf1155(_factoryOf1155).create1155Token(
      baseTokenURI,
      contractURI,
      creator,
      minter,
      admin
    );

    emit Create1155Token(address(createdAddress), baseTokenURI);
  }
}