// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './MarketplaceStorage.sol';

contract MarketplaceStorageAccessor is Ownable, MarketplaceStorage {
  function setFeeAddress(address payable feeAddress) public onlyOwner {
    require(feeAddress != address(0), 'MarketplaceStorageAccessor: fee address must not be a zero address');
    require(feeAddress != _feeAddress, 'MarketplaceStorageAccessor: already set fee address');

    _feeAddress = feeAddress;
  }

  function setMarketplaceAddress(address marketplaceAddress) public onlyOwner {
    require(marketplaceAddress != address(0), 'MarketplaceStorageAccessor: marketplace address must not be a zero address');
    require(marketplaceAddress != _marketplaceAddress, 'MarketplaceStorageAccessor: already set marketplace address');

    _marketplaceAddress = marketplaceAddress;
  }

  function setMarketplaceFee(uint marketplaceFee) public onlyOwner {
    require(marketplaceFee >= 0, 'MarketplaceStorageAccessor: marketplace fee must more than zero');

    _marketplaceFee = marketplaceFee;
  }

  function setSoldOrder(bytes32 orderHash, bool sold) internal {
    require(_soldOrder[orderHash] != sold, 'MarketplaceStorageAccessor: already setted value');

    _soldOrder[orderHash] = sold;
  }

  function setDivisionSoldCount(bytes32 orderHash, uint256 count) internal {
    require(count > 0, 'MarketplaceStorageAccessor: count must be more than zero');

    _divisionSoldCounts[orderHash] += count;
  }

  function setCancelled(bytes32 orderHash, bool cancel) internal {
    require(_cancelled[orderHash] != cancel, 'MarketplaceStorageAccessor: already set cancelled');
    _cancelled[orderHash] = cancel;
  }

  function setAdminAddress(address adminAddress, bool active) public onlyOwner {
    require(adminAddress != address(0), 'MarketplaceStorageAccessor: admin address must not be a zero address');
    require(_adminAddresses[adminAddress] != active, 'MarketplaceStorageAccessor: already set admin adress');

    _adminAddresses[adminAddress] = active;
  }

  function setTradableTokenAddress(address tokenAddress, bool active) public onlyOwner {
    require(tokenAddress != address(0), 'MarketplaceStorageAccessor: token address must not be a zero address');
    require(_tradableTokenAddresses[tokenAddress] != active, 'MarketplaceStorageAccessor: already set tradable token address');

    _tradableTokenAddresses[tokenAddress] = active;
  }

  function setSignPrefix(Wallet wallet, string calldata prefix) public onlyOwner {
    require(
      wallet == Wallet.KAIKAS ||
      wallet == Wallet.METAMASK ||
      wallet == Wallet.FAVORLET,
      'MarketplaceStorageAccessor: wallet is required'
    );
    require(bytes(prefix).length > 0, 'MarketplaceStorageAccessor: wallet is required');
    require(keccak256(bytes(_signPrefixes[wallet])) != keccak256(bytes(prefix)), 'MarketplaceStorageAccessor: already setted prefix');

    _signPrefixes[wallet] = prefix;
  }

  function getSignPrefix(Wallet wallet) public view returns (string memory) {
    return _signPrefixes[wallet];
  }

  function getFeeAddress() public view returns (address payable) {
    return _feeAddress;
  }

  function getMarketplaceAddress() public view returns (address) {
    return _marketplaceAddress;
  }

  function getMarketplaceFee() public view returns (uint256) {
    return _marketplaceFee;
  }

  function getSoldOrder(bytes32 hash) public view returns (bool) {
    return _soldOrder[hash];
  }

  function getDivisionSoldCount(bytes32 hash) public view returns (uint256) {
    return _divisionSoldCounts[hash];
  }

  function isCancelled(bytes32 orderHash) public view returns (bool) {
    return _cancelled[orderHash];
  }

  function isActiveAdminAddress(address adminAddress) public view returns (bool) {
    return _adminAddresses[adminAddress];
  }

  function isActiveTradableTokenAddress(address tokenAddress) public view returns (bool) {
    return _tradableTokenAddresses[tokenAddress];
  }
}