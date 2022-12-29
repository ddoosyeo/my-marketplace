// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

interface IMarketplaceStruct {
  enum Wallet { KAIKAS, METAMASK }

  struct SplitSignature {
    uint8 v;
    bytes32 r;
    bytes32 s;
  }

  struct FixedPrice721Order {
    address payable royaltyReceiver;
    address payable seller;
    address exchangeContract;
    address paymentToken;
    address reserveBuyer;
    uint256[] tokenIds;
    uint256 royalty;
    uint256 price;
    uint256 saleExpireTimestamp;
    bytes saleUniqueId;
    Wallet wallet;
  }

  struct FixedPrice1155Order {
    address payable royaltyReceiver;
    address payable seller;
    address exchangeContract;
    address paymentToken;
    address reserveBuyer;
    uint256 tokenId;
    uint256 quantity;
    uint256 royalty;
    uint256 piecePrice;
    uint256 saleExpireTimestamp;
    bytes saleUniqueId;
    Wallet wallet;
  }

  struct FixedPrice1155BundleOrder {
    address payable royaltyReceiver;
    address payable seller;
    address exchangeContract;
    address paymentToken;
    address reserveBuyer;
    uint256[] tokenIds;
    uint256[] quantities;
    uint256 royalty;
    uint256 bundlePrice;
    uint256 saleExpireTimestamp;
    bytes saleUniqueId;
    Wallet wallet;
  }

  struct Offer721Order {
    address payable royaltyReceiver;
    address payable seller;
    address payable buyer;
    address exchangeContract;
    address paymentToken;
    uint tokenId;
    uint royalty;
    uint price;
    uint offerExpireTimestamp;
    Wallet wallet;
  }

  struct Offer1155Order {
    address payable royaltyReceiver;
    address payable seller;
    address payable buyer;
    address exchangeContract;
    address paymentToken;
    uint tokenId;
    uint quantity;
    uint royalty;
    uint price;
    uint offerExpireTimestamp;
    Wallet wallet;
  }
}