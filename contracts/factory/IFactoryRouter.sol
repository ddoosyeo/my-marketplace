// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IFactoryRouter {
  event Create721Token(address indexed tokenAddress, string indexed name, string indexed symbol);
  event Create1155Token(address indexed tokenAddress, string indexed baseTokenURI);
}