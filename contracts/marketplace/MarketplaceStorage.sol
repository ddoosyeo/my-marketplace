// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import './interfaces/IMarketplaceStruct.sol';

contract MarketplaceStorage is IMarketplaceStruct {
  mapping(bytes32 => bool) internal _soldOrder;
  mapping(bytes32 => uint256) internal _divisionSoldCounts;
  mapping(address => bool) internal _adminAddresses;

  mapping(address => bool) internal _tradableTokenAddresses;
  mapping(bytes32 => bool) internal _cancelled;
  mapping(Wallet => string) internal _signPrefixes;

  uint internal constant INVERSE_BASIS_POINT = 10000;

  address internal _marketplaceAddress;
  address payable internal _feeAddress;
  uint internal _marketplaceFee;
}