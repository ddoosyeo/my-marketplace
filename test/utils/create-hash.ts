import { BigNumber } from '@ethersproject/bignumber';
import { ethers, web3 } from 'hardhat';

type Create721OrderType = {
  royaltyReceiver: string;
  seller: string;
  exchangeContract: string;
  paymentToken: string;
  reserveBuyer: string;
  tokenIds: number[];
}

type Create1155OrderType = {
  royaltyReceiver: string;
  seller: string;
  exchangeContract: string;
  paymentToken: string;
  reserveBuyer: string;
  tokenId: number;
  quantity: number;
}

type Create1155BundleOrderType = {
  royaltyReceiver: string;
  seller: string;
  exchangeContract: string;
  paymentToken: string;
  reserveBuyer: string;
  tokenIds: number[];
  quantities: number[];
}

type Create721OfferOrderType = {
  royaltyReceiver: string;
  seller: string;
  buyer: string;
  exchangeContract: string;
  paymentToken: string;
  tokenId: number;
}

type Create1155OfferOrderType = {
  royaltyReceiver: string;
  seller: string;
  buyer: string;
  exchangeContract: string;
  paymentToken: string;
  tokenId: number;
  quantity: number;
}

type ERC721Order = {
  royaltyReceiver: string;
  seller: string;
  exchangeContract: string;
  paymentToken: string;
  reserveBuyer: string;
  tokenIds: number[];
  royalty: number;
  price: BigNumber;
  saleExpireTimestamp: number;
  saleUniqueId: string;
  wallet: number;
}

type ERC1155Order = {
  royaltyReceiver: string;
  seller: string;
  exchangeContract: string;
  paymentToken: string;
  reserveBuyer: string;
  tokenId: number;
  quantity: number;
  royalty: number;
  piecePrice: BigNumber;
  saleExpireTimestamp: number;
  saleUniqueId: string;
  wallet: number;
}

type ERC1155BundleOrder = {
  royaltyReceiver: string;
  seller: string;
  exchangeContract: string;
  paymentToken: string;
  reserveBuyer: string;
  tokenIds: number[];
  quantities: number[];
  royalty: number;
  bundlePrice: BigNumber;
  saleExpireTimestamp: number;
  saleUniqueId: string;
  wallet: number;
}

type ERC721OfferOrder = {
  royaltyReceiver: string;
  seller: string;
  buyer: string;
  exchangeContract: string;
  paymentToken: string;
  tokenId: number;
  royalty: number;
  price: BigNumber;
  offerExpireTimestamp: number;
  wallet: number;
}

type ERC1155OfferOrder = {
  royaltyReceiver: string;
  seller: string;
  buyer: string;
  exchangeContract: string;
  paymentToken: string;
  tokenId: number;
  quantity: number;
  royalty: number;
  price: BigNumber;
  offerExpireTimestamp: number;
  wallet: number;
}

export const create1155OfferOrder = (param: Create1155OfferOrderType) => {
  return {
    ...param,
    royalty: 1000,
    price: ethers.utils.parseEther('1'),
    offerExpireTimestamp: Math.round(new Date('2022-12-01T09:00:00.000Z').getTime() / 1000),
    wallet: 0
  }
}

export const create721OfferOrder = (param: Create721OfferOrderType) => {
  return {
    ...param,
    royalty: 1000,
    price: ethers.utils.parseEther('1'),
    offerExpireTimestamp: Math.round(new Date('2022-12-01T09:00:00.000Z').getTime() / 1000),
    wallet: 0
  };
}

export const create1155OfferHash = (order: ERC1155OfferOrder) => {
  return web3.utils.soliditySha3(
    { type: 'address', value: order.royaltyReceiver },
    { type: 'address', value: order.seller },
    { type: 'address', value: order.buyer },
    { type: 'address', value: order.exchangeContract },
    { type: 'address', value: order.paymentToken },
    { type: 'uint', value: `${order.tokenId}` },
    { type: 'uint', value: `${order.quantity}` },
    { type: 'uint', value: `${order.royalty}` },
    { type: 'uint', value: `${order.price}` },
    { type: 'uint', value: `${order.offerExpireTimestamp}` },
    { type: 'uint8', value: `${order.wallet}` }
  ) as string;
}

export const create721OfferHash = (order: ERC721OfferOrder) => {
  return web3.utils.soliditySha3(
    { type: 'address', value: order.royaltyReceiver },
    { type: 'address', value: order.seller },
    { type: 'address', value: order.buyer },
    { type: 'address', value: order.exchangeContract },
    { type: 'address', value: order.paymentToken },
    { type: 'uint', value: `${order.tokenId}` },
    { type: 'uint', value: `${order.royalty}` },
    { type: 'uint', value: `${order.price}` },
    { type: 'uint', value: `${order.offerExpireTimestamp}` },
    { type: 'uint8', value: `${order.wallet}` }
  ) as string;
}

export const create721Order = (param: Create721OrderType) => {
  return {
    ...param,
    royalty: 1000,
    price: ethers.utils.parseEther('1'),
    saleExpireTimestamp: Math.round(new Date('2023-12-01T09:00:00.000Z').getTime() / 1000),
    saleUniqueId: ethers.utils.formatBytes32String('1234'),
    wallet: 0
  }
}

export const create721Hash = (order: ERC721Order) => {
  const tokenIdsToObject = order.tokenIds.map((tokenId) => (
    { type: 'uint', value: `${tokenId}` }
  ));

  return web3.utils.soliditySha3(
    { type: 'address', value: order.royaltyReceiver },
    { type: 'address', value: order.seller },
    { type: 'address', value: order.exchangeContract },
    { type: 'address', value: order.paymentToken },
    { type: 'address', value: order.reserveBuyer },
    ...tokenIdsToObject,
    { type: 'uint', value: `${order.royalty}` },
    { type: 'uint', value: `${order.price}` },
    { type: 'uint', value: `${order.saleExpireTimestamp}` },
    { type: 'bytes', value: order.saleUniqueId },
    { type: 'uint8', value: `${order.wallet}` }
  ) as string;
}

export const create1155Order = (param: Create1155OrderType) => {
  return {
    ...param,
    royalty: 1000,
    piecePrice: ethers.utils.parseEther('1'),
    saleExpireTimestamp: Math.round(new Date('2023-12-01T09:00:00.000Z').getTime() / 1000),
    saleUniqueId: ethers.utils.formatBytes32String('1234'),
    wallet: 0
  }
}

export const create1155BundleOrder = (param: Create1155BundleOrderType) => {
  return {
    ...param,
    royalty: 1000,
    bundlePrice: ethers.utils.parseEther('1'),
    saleExpireTimestamp: Math.round(new Date('2023-12-01T09:00:00.000Z').getTime() / 1000),
    saleUniqueId: ethers.utils.formatBytes32String('1234'),
    wallet: 0
  }
}

export const create1155Hash = (order: ERC1155Order) => {
  return web3.utils.soliditySha3(
    { type: 'address', value: order.royaltyReceiver },
    { type: 'address', value: order.seller },
    { type: 'address', value: order.exchangeContract },
    { type: 'address', value: order.paymentToken },
    { type: 'address', value: order.reserveBuyer },
    { type: 'uint', value: `${order.tokenId}` },
    { type: 'uint', value: `${order.quantity}` },
    { type: 'uint', value: `${order.royalty}` },
    { type: 'uint', value: `${order.piecePrice}` },
    { type: 'uint', value: `${order.saleExpireTimestamp}` },
    { type: 'bytes', value: order.saleUniqueId },
    { type: 'uint8', value: `${order.wallet}` }
  ) as string;
}

export const create1155BundleHash = (order: ERC1155BundleOrder) => {
  const tokenIdsToObject = order.tokenIds.map((tokenId) => (
    { type: 'uint', value: `${tokenId}` }
  ));

  const quantitiesToObject = order.quantities.map((quantity) => (
    { type: 'uint', value: `${quantity}` }
  ));

  return web3.utils.soliditySha3(
    { type: 'address', value: order.royaltyReceiver },
    { type: 'address', value: order.seller },
    { type: 'address', value: order.exchangeContract },
    { type: 'address', value: order.paymentToken },
    { type: 'address', value: order.reserveBuyer },
    ...tokenIdsToObject,
    ...quantitiesToObject,
    { type: 'uint', value: `${order.royalty}` },
    { type: 'uint', value: `${order.bundlePrice}` },
    { type: 'uint', value: `${order.saleExpireTimestamp}` },
    { type: 'bytes', value: order.saleUniqueId },
    { type: 'uint8', value: `${order.wallet}` }
  ) as string;
}