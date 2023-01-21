// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';

import './interfaces/IMarketplaceExchange.sol';
import './MarketplaceOrderVerifier.sol';
import './MarketplacePaymentManager.sol';

contract MarketplaceExchange is IMarketplaceExchange, MarketplaceOrderVerifier, MarketplacePaymentManager {
  event Unpack(address indexed nftAddress, address indexed from, uint indexed tokenId, string unpackId);

  function submitOrder(
    FixedPrice721Order[] calldata orders,
    SplitSignature[] calldata sellSignatures
  ) external payable {
    require(orders.length == sellSignatures.length, 'MarketplaceExchange: orders length must be equal signatures length');
    require(orders.length > 0, 'MarketplaceExchange: orders is require');

    uint256 valueRequiredForOrder;
    for (uint256 i = 0; i < orders.length; i++) {
      if (orders[i].paymentToken == address(0)) {
        valueRequiredForOrder += orders[i].price;
      }
    }

    require(valueRequiredForOrder == msg.value, 'MarketplaceExchange: value is not matched');

    for (uint256 i = 0; i < orders.length; i++) {
      FixedPrice721Order memory order = orders[i];
      SplitSignature memory sellSignature = sellSignatures[i];

      bytes32 orderHash = orderToHash(order);

      validateMessageSenderIsEOA(msg.sender);
      validateSignerMatch(orderHash, order.seller, sellSignature, order.wallet);
      validateOrder(order, orderHash);

      (uint256 price, uint256 royalty, uint256 fee) = payForFixedPriceOrder(
        order.price,
        order.royalty,
        order.paymentToken,
        order.royaltyReceiver,
        order.seller
      );

      for (uint256 k = 0; k < order.tokenIds.length; k++) {
        IERC721(order.exchangeContract).safeTransferFrom(
          order.seller,
          msg.sender,
          order.tokenIds[k]
        );
      }

      setSoldOrder(orderHash, true);

      emit OrdersMatched(order.seller, msg.sender, order.paymentToken, orderHash, 1, order.price);
      emit SaleAmount(order.paymentToken, orderHash, price, 1, royalty, fee);
    }
  }

  function submitOrder(
    FixedPrice1155Order[] calldata orders,
    SplitSignature[] calldata sellSignatures,
    uint256[] calldata buyQuantities
  ) external payable {
    require(
      orders.length == sellSignatures.length &&
      orders.length == buyQuantities.length, 
    'MarketplaceExchange: orders length must be equal signatures length and buyQuantities length');
    
    require(orders.length > 0, 'MarketplaceExchange: orders is require');

    uint256 valueRequiredForOrder;
    for (uint256 i = 0; i < orders.length; i++) {
      if (orders[i].paymentToken == address(0)) {
        valueRequiredForOrder += orders[i].piecePrice * buyQuantities[i];
      }
    }

    require(valueRequiredForOrder == msg.value, 'MarketplaceExchange: value is not matched');

    for (uint256 i = 0; i < orders.length; i++) {
      FixedPrice1155Order memory order = orders[i];
      SplitSignature memory sellSignature = sellSignatures[i];
      uint256 buyQuantity = buyQuantities[i];

      bytes32 orderHash = orderToHash(order);

      validateMessageSenderIsEOA(msg.sender);
      validateSignerMatch(orderHash, order.seller, sellSignature, order.wallet);
      validateOrder(order, orderHash, buyQuantity);

      (uint256 price, uint256 royalty, uint256 fee) = payForFixedPriceOrder(
        order.piecePrice * buyQuantity,
        order.royalty,
        order.paymentToken,
        order.royaltyReceiver,
        order.seller
      );

      IERC1155(order.exchangeContract).safeTransferFrom(
        order.seller,
        msg.sender,
        order.tokenId,
        buyQuantity,
        ''
      );

      setDivisionSoldCount(orderHash, buyQuantity);

      if (getDivisionSoldCount(orderHash) == order.quantity) {
        setSoldOrder(orderHash, true);
      }

      emit OrdersMatched(order.seller, msg.sender, order.paymentToken, orderHash, buyQuantity, price);
      emit SaleAmount(order.paymentToken, orderHash, price, buyQuantity, royalty, fee);
    }
  }

  function submitOrder(
    FixedPrice1155BundleOrder[] calldata orders,
    SplitSignature[] calldata sellSignatures
  ) external payable {
    require(orders.length == sellSignatures.length, 'MarketplaceExchange: orders length must be equal signatures length');
    
    require(orders.length > 0, 'MarketplaceExchange: orders is require');

    uint256 valueRequiredForOrder;
    for (uint256 i = 0; i < orders.length; i++) {
      if (orders[i].paymentToken == address(0)) {
        valueRequiredForOrder += orders[i].bundlePrice;
      }
    }

    require(valueRequiredForOrder == msg.value, 'MarketplaceExchange: value is not matched');

    for (uint256 i = 0; i < orders.length; i++) {
      FixedPrice1155BundleOrder memory order = orders[i];
      SplitSignature memory sellSignature = sellSignatures[i];

      bytes32 orderHash = orderToHash(order);

      validateMessageSenderIsEOA(msg.sender);
      validateSignerMatch(orderHash, order.seller, sellSignature, order.wallet);
      validateOrder(order, orderHash);

      (uint256 price, uint256 royalty, uint256 fee) = payForFixedPriceOrder(
        order.bundlePrice,
        order.royalty,
        order.paymentToken,
        order.royaltyReceiver,
        order.seller
      );

      for (uint256 k = 0; k < order.tokenIds.length; k++) {
        IERC1155(order.exchangeContract).safeTransferFrom(
          order.seller,
          msg.sender,
          order.tokenIds[k],
          order.quantities[k],
          ''
        );
      }

      setSoldOrder(orderHash, true);

      emit OrdersMatched(order.seller, msg.sender, order.paymentToken, orderHash, 0, order.bundlePrice);
      emit SaleAmount(order.paymentToken, orderHash, price, 0, royalty, fee);
    }
  }

  function submitOrder(
    Offer721Order calldata order,
    SplitSignature calldata buySignature
  ) external {
    bytes32 orderHash = orderToHash(order);

    validateMessageSenderIsEOA(msg.sender);
    validateSignerMatch(orderHash, order.buyer, buySignature, order.wallet);
    validateOrder(order, orderHash);

    (uint256 price, uint256 royalty, uint256 fee) = payForOfferOrder(
      order.price,
      order.royalty,
      order.paymentToken,
      order.royaltyReceiver,
      order.buyer
    );

    IERC721(order.exchangeContract).safeTransferFrom(
      msg.sender,
      order.buyer,
      order.tokenId,
      ''
    );

    setSoldOrder(orderHash, true);

    emit OrdersMatched(msg.sender, order.buyer, order.paymentToken, orderHash, 1, order.price);
    emit SaleAmount(order.paymentToken, orderHash, price, 1, royalty, fee);
  }

  function submitOrder(
    Offer1155Order calldata order,
    SplitSignature calldata buySignature
  ) external {
    bytes32 orderHash = orderToHash(order);

    validateMessageSenderIsEOA(msg.sender);
    validateSignerMatch(orderHash, order.buyer, buySignature, order.wallet);
    validateOrder(order, orderHash);

    (uint256 price, uint256 royalty, uint256 fee) = payForOfferOrder(
      order.price,
      order.royalty,
      order.paymentToken,
      order.royaltyReceiver,
      order.buyer
    );

    IERC1155(order.exchangeContract).safeTransferFrom(
      msg.sender,
      order.buyer,
      order.tokenId,
      order.quantity,
      ''
    );

    setSoldOrder(orderHash, true);

    emit OrdersMatched(msg.sender, order.buyer, order.paymentToken, orderHash, order.quantity, order.price);
    emit SaleAmount(order.paymentToken, orderHash, price, order.quantity, royalty, fee);
  }

  function cancelOrder(
    FixedPrice721Order calldata order
  ) external {
    require(msg.sender == order.seller, 'MarketplaceExchange: message sender must be equal seller.');

    bytes32 orderHash = orderToHash(order);
    setCancelled(orderHash, true);

    emit OrderCancelled(msg.sender, orderHash);
  }

  function cancelOrder(
    FixedPrice1155Order calldata order
  ) external {
    require(msg.sender == order.seller, 'MarketplaceExchange: message sender must be equal seller.');

    bytes32 orderHash = orderToHash(order);
    setCancelled(orderHash, true);

    emit OrderCancelled(msg.sender, orderHash);
  }

  function cancelOrder(
    FixedPrice1155BundleOrder calldata order
  ) external {
    require(msg.sender == order.seller, 'MarketplaceExchange: message sender must be equal seller.');

    bytes32 orderHash = orderToHash(order);
    setCancelled(orderHash, true);

    emit OrderCancelled(msg.sender, orderHash);
  }

  function batchTransferForNFT(
    address contractAddress,
    address toAddress,
    uint256[] calldata tokenIds
  ) public {
    require(contractAddress != address(0), 'MarketplaceExchange: contract address must be not zero address');
    require(tokenIds.length <= 100, 'MarketplaceExchange: to addresses length must be less than max transfer size');

    for (uint256 i = 0; i < tokenIds.length; i++) {
      IERC721(contractAddress).transferFrom(msg.sender, toAddress, tokenIds[i]);
    }
  }

  function batchTransferForNFT(
    address contractAddress,
    address[] calldata toAddresses,
    uint256[] calldata tokenIds
  ) public {
    require(contractAddress != address(0), 'MarketplaceExchange: contract address must be not zero address');
    require(toAddresses.length == tokenIds.length, 'MarketplaceExchange: toAddresses length with token ids length not matched');
    require(tokenIds.length <= 100, 'MarketplaceExchange: to addresses length must be less than max transfer size');

    for (uint256 i = 0; i < tokenIds.length; i++) {
      IERC721(contractAddress).transferFrom(msg.sender, toAddresses[i], tokenIds[i]);
    }
  }
}