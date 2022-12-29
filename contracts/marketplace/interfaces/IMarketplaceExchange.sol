// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import './IMarketplaceStruct.sol';

interface IMarketplaceExchange is IMarketplaceStruct {

  event OrdersMatched(
    address indexed seller,
    address indexed buyer,
    address indexed paymentToken,
    bytes32 orderHash,
    uint256 quantity,
    uint price
  );

  event AcceptOffer(
    address indexed buyer,
    bytes32 indexed orderHash
  );

  event SaleAmount(
    address indexed paymentToken,
    bytes32 indexed orderHash,
    uint256 indexed price,
    uint256 quantity,
    uint256 royalty,
    uint256 fee
  );

  event OrderCancelled(
    address indexed seller,
    bytes32 indexed orderHash
  );

  function submitOrder(
    FixedPrice721Order[] calldata orders,
    SplitSignature[] calldata sellSignatures
  ) external payable;

  function submitOrder(
    FixedPrice1155Order[] calldata orders,
    SplitSignature[] calldata sellSignatures,
    uint256[] calldata buyQuantities
  ) external payable;

  function submitOrder(
    FixedPrice1155BundleOrder[] calldata orders,
    SplitSignature[] calldata sellSignatures
  ) external payable;

  function submitOrder(
    Offer721Order calldata order,
    SplitSignature calldata buySignature
  ) external;

  function submitOrder(
    Offer1155Order calldata order,
    SplitSignature calldata buySignature
  ) external;

  function cancelOrder(FixedPrice721Order calldata order) external;

  function cancelOrder(FixedPrice1155Order calldata order) external;

  function cancelOrder(FixedPrice1155BundleOrder calldata order) external;
}