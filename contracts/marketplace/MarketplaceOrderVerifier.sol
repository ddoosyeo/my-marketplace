// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/Strings.sol';

import './MarketplaceStorageAccessor.sol';

contract MarketplaceOrderVerifier is MarketplaceStorageAccessor {

  function orderToHash(FixedPrice721Order memory order) internal pure returns (bytes32) {
    bytes memory encodedData = abi.encodePacked(
      order.royaltyReceiver,
      order.seller,
      order.exchangeContract,
      order.paymentToken,
      order.reserveBuyer
    );

    for (uint256 i = 0; i < order.tokenIds.length; i++) {
      encodedData = abi.encodePacked(encodedData, order.tokenIds[i]);
    }

    encodedData = abi.encodePacked(
      encodedData,
      order.royalty,
      order.price,
      order.saleExpireTimestamp,
      order.saleUniqueId,
      order.wallet
    );

    bytes32 orderHash = keccak256(encodedData);

    return orderHash;
  }

  function orderToHash(FixedPrice1155BundleOrder memory order) internal pure returns (bytes32) {
    bytes memory encodedData = abi.encodePacked(
      order.royaltyReceiver,
      order.seller,
      order.exchangeContract,
      order.paymentToken,
      order.reserveBuyer
    );

    for (uint256 i = 0; i < order.tokenIds.length; i++) {
      encodedData = abi.encodePacked(encodedData, order.tokenIds[i]);
    }

    for (uint256 k = 0; k < order.quantities.length; k++) {
      encodedData = abi.encodePacked(encodedData, order.quantities[k]);
    }

    encodedData = abi.encodePacked(
      encodedData,
      order.royalty,
      order.bundlePrice,
      order.saleExpireTimestamp,
      order.saleUniqueId,
      order.wallet
    );

    bytes32 orderHash = keccak256(encodedData);

    return orderHash;
  }

  function orderToHash(FixedPrice1155Order memory order) internal pure returns (bytes32) {
    bytes memory encodedData = abi.encodePacked(
      order.royaltyReceiver,
      order.seller,
      order.exchangeContract,
      order.paymentToken,
      order.reserveBuyer,
      order.tokenId,
      order.quantity,
      order.royalty,
      order.piecePrice,
      order.saleExpireTimestamp,
      order.saleUniqueId,
      order.wallet
    );

    bytes32 orderHash = keccak256(encodedData);

    return orderHash;
  }

  function orderToHash(Offer721Order memory order) internal pure returns (bytes32) {
    bytes32 orderHash = keccak256(
      abi.encodePacked(
        order.royaltyReceiver,
        order.seller,
        order.buyer,
        order.exchangeContract,
        order.paymentToken,
        order.tokenId,
        order.royalty,
        order.price,
        order.offerExpireTimestamp,
        order.wallet
      )
    );

    return orderHash;
  }

  function orderToHash(Offer1155Order memory order) internal pure returns (bytes32) {
    bytes32 orderHash = keccak256(
      abi.encodePacked(
        order.royaltyReceiver,
        order.seller,
        order.buyer,
        order.exchangeContract,
        order.paymentToken,
        order.tokenId,
        order.quantity,
        order.royalty,
        order.price,
        order.offerExpireTimestamp,
        order.wallet
      )
    );

    return orderHash;
  }

  function validateSignerMatch(
    bytes32 orderHash,
    address signer,
    SplitSignature memory splitSignature,
    Wallet wallet
  ) internal view {
    bytes32 hashWithPrefix = hashWithWalletPrefix(orderHash, wallet);

    require(
      ecrecover(hashWithPrefix, splitSignature.v, splitSignature.r, splitSignature.s) == signer,
      'MarketplaceOrderVerifier: signer not matched or order not matched'
    );
  }

  function hashWithWalletPrefix(bytes32 orderHash, Wallet wallet) internal view returns (bytes32) {
    string memory prefix = getSignPrefix(wallet);

    bytes32 hashWithPrefix = keccak256(
      abi.encodePacked(
        prefix,
        Strings.toString(orderHash.length),
        orderHash
      )
    );

    return hashWithPrefix;
  }

  function validateOrder(FixedPrice721Order memory order, bytes32 orderHash) internal view {
    require(!isCancelled(orderHash), 'MarketplaceOrderVerifier: already cancel order');

    require(getSoldOrder(orderHash) == false, 'MarketplaceOrderVerifier: already sold order');

    require(
      order.saleExpireTimestamp == 0 ||
      order.saleExpireTimestamp > block.timestamp,
      'MarketplaceOrderVerifier: already expired order'
    );

    require(
      order.reserveBuyer == address(0) ||
      order.reserveBuyer == msg.sender,
      'MarketplaceOrderVerifier: reserve buyer not matched'
    );

    require(
      order.tokenIds.length > 0,
      'MarketplaceOrderVerifier: tokenIds must more than 0'
    );

    require(
      order.exchangeContract != address(0),
      'MarketplaceOrderVerifier: exchangeContract address must be not zero'
    );
  }

  function validateOrder(FixedPrice1155Order memory order, bytes32 orderHash, uint256 buyQuantity) internal view {
    require(!isCancelled(orderHash), 'MarketplaceOrderVerifier: already cancel order');

    require(order.quantity >= buyQuantity, 'MarketplaceOrderVerifier: buy quantity not enough');

    require(getSoldOrder(orderHash) == false, 'MarketplaceOrderVerifier: already sold order');

    require(
      getDivisionSoldCount(orderHash) + buyQuantity <= order.quantity,
      'MarketplaceOrderVerifier: not enough quantity'
    );

    require(
      order.saleExpireTimestamp == 0 ||
      order.saleExpireTimestamp > block.timestamp,
      'MarketplaceOrderVerifier: already expired order'
    );

    require(
      order.reserveBuyer == address(0) ||
      order.reserveBuyer == msg.sender,
      'MarketplaceOrderVerifier: reserve buyer not matched'
    );

    require(
      order.exchangeContract != address(0),
      'MarketplaceOrderVerifier: exchangeContract address must be not zero'
    );
  }

  function validateOrder(FixedPrice1155BundleOrder memory order, bytes32 orderHash) internal view {
    require(!isCancelled(orderHash), 'MarketplaceOrderVerifier: already cancel order');

    require(getSoldOrder(orderHash) == false, 'MarketplaceOrderVerifier: already sold order');

    require(
      order.tokenIds.length == order.quantities.length,
      'MarketplaceOrderVerifier: token ids length must be equal quantities length'
     );

    require(
      order.saleExpireTimestamp == 0 ||
      order.saleExpireTimestamp > block.timestamp,
      'MarketplaceOrderVerifier: already expired order'
    );

    require(
      order.reserveBuyer == address(0) ||
      order.reserveBuyer == msg.sender,
      'MarketplaceOrderVerifier: reserve buyer not matched'
    );

    require(
      order.exchangeContract != address(0),
      'MarketplaceOrderVerifier: exchangeContract address must be not zero'
    );
  }

  function validateOrder(Offer721Order memory order, bytes32 orderHash) internal view {
    require(!isCancelled(orderHash), 'MarketplaceOrderVerifier: already cancel order');

    require(getSoldOrder(orderHash) == false, 'MarketplaceOrderVerifier: already sold order');

    require(
      order.offerExpireTimestamp == 0 ||
      order.offerExpireTimestamp > block.timestamp,
      'MarketplaceOrderVerifier: already expired offer'
    );

    require(
      order.seller == msg.sender,
      'MarketplaceOrderVerifier: seller and message sender not matched'
    );

    require(
      order.exchangeContract != address(0),
      'MarketplaceOrderVerifier: exchangeContract address must be not zero'
    );
  }

  function validateOrder(Offer1155Order memory order, bytes32 orderHash) internal view {
    require(!isCancelled(orderHash), 'MarketplaceOrderVerifier: already cancel order');

    require(getSoldOrder(orderHash) == false, 'MarketplaceOrderVerifier: already sold order');

    require(
      order.offerExpireTimestamp == 0 ||
      order.offerExpireTimestamp > block.timestamp,
      'MarketplaceOrderVerifier: already expired offer'
    );

    require(
      order.seller == msg.sender,
      'MarketplaceOrderVerifier: seller and message sender not matched'
    );

    require(
      order.exchangeContract != address(0),
      'MarketplaceOrderVerifier: exchangeContract address must be not zero'
    );
  }

  function validateMessageSenderIsEOA(address targetAddress) internal view {
    uint size;

    assembly {
      size := extcodesize(targetAddress)
    }

    require(size == 0, 'MarketplaceOrderVerifier: target is must EOA');
  }
}