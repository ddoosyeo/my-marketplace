// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import './MarketplaceStorageAccessor.sol';

contract MarketplacePaymentManager is MarketplaceStorageAccessor {
  function payForFixedPriceOrder(
    uint256 price,
    uint256 royalty,
    address paymentToken,
    address payable royaltyReceiver,
    address payable seller
  ) internal returns (uint256, uint256, uint256) {
    if (paymentToken != address(0)) {
      require(msg.value == 0, 'MarketplacePaymentManager: must be value is zero');
      require(
        isActiveTradableTokenAddress(paymentToken),
        'MarketplacePaymentManager: impossible transfer token type'
      );
    }

    address payable feeAddress = getFeeAddress();

    (
      uint256 royaltyAmount,
      uint256 feeAmount,
      uint256 receiveAmount
    ) = calculateAmount(price, royalty, royaltyReceiver);

    if (paymentToken == address(0)) {
      require(msg.value >= price, 'MarketplacePaymentManager: not matched buy price with value');

      if (feeAmount > 0) {
        feeAddress.transfer(feeAmount);
      }

      if (royaltyAmount > 0) {
        royaltyReceiver.transfer(royaltyAmount);
      }

      if (receiveAmount > 0) {
        seller.transfer(receiveAmount);
      }
    } else {
      if (feeAmount > 0) {
        require(
          IERC20(paymentToken).transferFrom(msg.sender, feeAddress, feeAmount),
          'MarketplacePaymentManager: failed fee amount transfer'
        );
      }

      if (royaltyAmount > 0) {
        require(
          IERC20(paymentToken).transferFrom(msg.sender, royaltyReceiver, royaltyAmount),
          'MarketplacePaymentManager: failed royalty amount transfer'
        );
      }

      if (receiveAmount > 0) {
        require(
          IERC20(paymentToken).transferFrom(msg.sender, seller, receiveAmount),
          'MarketplacePaymentManager: failed receive amount transfer'
        );
      }
    }

    return (price, royaltyAmount, feeAmount);
  }

  function payForOfferOrder(
    uint price,
    uint royalty,
    address paymentToken,
    address payable royaltyReceiver,
    address payable buyer
  ) internal returns (uint, uint, uint) {
    require(
      paymentToken != address(0),
      'MarketplacePaymentManager: payment token address must be not zero when offer'
    );

    require(
      isActiveTradableTokenAddress(paymentToken),
      'MarketplacePaymentManager: impossible transfer token type'
    );

    address payable feeAddress = getFeeAddress();

    (
      uint256 royaltyAmount,
      uint256 feeAmount,
      uint256 receiveAmount
    ) = calculateAmount(price, royalty, royaltyReceiver);

    if (feeAmount > 0) {
      require(
        IERC20(paymentToken).transferFrom(buyer, feeAddress, feeAmount),
        'MarketplacePaymentManager: failed fee amount transfer'
      );
    }

    if (royaltyAmount > 0) {
      require(
        IERC20(paymentToken).transferFrom(buyer, royaltyReceiver, royaltyAmount),
        'MarketplacePaymentManager: failed royalty amount transfer'
      );
    }

    if (receiveAmount > 0) {
      require(
        IERC20(paymentToken).transferFrom(buyer, msg.sender, receiveAmount),
        'MarketplacePaymentManager: failed receive amount transfer'
      );
    }

    return (price, royaltyAmount, feeAmount);
  }

  function calculateAmount(
    uint256 price,
    uint256 royalty,
    address royaltyReceiver
  ) internal view returns (uint, uint, uint) {
    if (price == 0) {
      return (0, 0, 0);
    }

    address feeAddress = getFeeAddress();
    uint256 fee = getMarketplaceFee();

    uint256 royaltyAmount = 0;
    uint256 feeAmount = 0;
    uint256 receiveAmount = 0;

    if (royaltyReceiver != address(0) && royalty > 0) {
      royaltyAmount = SafeMath.div(SafeMath.mul(royalty, price), INVERSE_BASIS_POINT);
    }

    if (feeAddress != address(0) && fee > 0) {
      feeAmount = SafeMath.div(SafeMath.mul(fee, price), INVERSE_BASIS_POINT);
    }

    receiveAmount = SafeMath.sub(SafeMath.sub(price, royaltyAmount), feeAmount);

    return (royaltyAmount, feeAmount, receiveAmount);
  }
}