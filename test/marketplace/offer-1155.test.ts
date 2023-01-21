import { ethers, web3 } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { create1155OfferOrder, create1155OfferHash } from '../utils/create-hash';

describe('1155 offer order exchange test', () => {
  const deployFixture = async () => {
    const [creator, minter, manager, seller, buyer, feeReceiver] = await ethers.getSigners();

    const BASE_URL = 'http://test.com/';
    const CONTRACT_URI = 'http://test.com/';
    const CREATOR_ADDRESS = creator.address;
    const MINTER_ADDRESS = minter.address;
    const MANAGER_ADDRESS = manager.address;

    const Custom1155Factory = await ethers.getContractFactory('Custom1155');
    const custom1155 = await Custom1155Factory.deploy(
      BASE_URL,
      CONTRACT_URI,
      CREATOR_ADDRESS,
      MINTER_ADDRESS,
      MANAGER_ADDRESS
    );

    const Custom20Factory = await ethers.getContractFactory('Custom20');
    const custom20 = await Custom20Factory.deploy('F20', 'F20');

    const MarketplaceExchangeFactory = await ethers.getContractFactory('MarketplaceExchange');
    const marketplaceExchange = await MarketplaceExchangeFactory.deploy();

    await custom20.mint(buyer.address, ethers.utils.parseEther('10'));
    await marketplaceExchange.setFeeAddress(feeReceiver.address);
    await marketplaceExchange.setMarketplaceFee(1000);
    await marketplaceExchange.setSignPrefix(0, '\x19Klaytn Signed Message:\n');
    await marketplaceExchange.setSignPrefix(1, '\x19Ethereum Signed Message:\n');

    return { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer };
  }

  it('signer and buyer addresses must match', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: seller.address,
      buyer: buyer.address,
      exchangeContract: custom1155.address,
      paymentToken: ethers.constants.AddressZero,
      tokenId: 0,
      quantity: 5
    });

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    await expect(marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    )).to.be.revertedWith('MarketplaceOrderVerifier: signer not matched or order not matched');
  });

  it('can only be sold before the offer expiration date has passed', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: seller.address,
      buyer: buyer.address,
      exchangeContract: custom1155.address,
      paymentToken: ethers.constants.AddressZero,
      tokenId: 0,
      quantity: 5
    });

    order.offerExpireTimestamp = Math.round(new Date('2022-10-01T09:00:00.000Z').getTime() / 1000);

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    await expect(marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    )).to.be.revertedWith('MarketplaceOrderVerifier: already expired offer');
  });

  it('seller and the message sender must match', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: buyer.address,
      buyer: buyer.address,
      exchangeContract: custom1155.address,
      paymentToken: ethers.constants.AddressZero,
      tokenId: 0,
      quantity: 5
    });

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    await expect(marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    )).to.be.revertedWith('MarketplaceOrderVerifier: seller and message sender not matched');
  });

  it('exchange address must be non-zero', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: seller.address,
      buyer: buyer.address,
      exchangeContract: ethers.constants.AddressZero,
      paymentToken: ethers.constants.AddressZero,
      tokenId: 0,
      quantity: 5
    });

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    await expect(marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    )).to.be.revertedWith('MarketplaceOrderVerifier: exchangeContract address must be not zero');
  });

  it('offer order can only be traded with ERC20', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: seller.address,
      buyer: buyer.address,
      exchangeContract: custom20.address,
      paymentToken: ethers.constants.AddressZero,
      tokenId: 0,
      quantity: 5
    });

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    await expect(marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    )).to.be.revertedWith('MarketplacePaymentManager: payment token address must be not zero when offer');
  });

  it('when purchasing with ERC20 tokens, you can only trade with tokens registered as tradable tokens', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: seller.address,
      buyer: buyer.address,
      exchangeContract: custom1155.address,
      paymentToken: custom20.address,
      tokenId: 0,
      quantity: 5
    });

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    await expect(marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    )).to.be.revertedWith('MarketplacePaymentManager: impossible transfer token type');
  });

  it('offer accept must succeed', async () => {
    const { custom1155, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom1155.connect(minter).mint(seller.address, 0, 10, 0, []);
    await mintTx.wait();

    const approveTx = await custom1155.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create1155OfferOrder({
      royaltyReceiver: seller.address,
      seller: seller.address,
      buyer: buyer.address,
      exchangeContract: custom1155.address,
      paymentToken: custom20.address,
      tokenId: 0,
      quantity: 5
    });

    const hash = create1155OfferHash(order);

    const buySignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(buySignature);

    const approveERC20Tx = await custom20.connect(buyer).approve(
      marketplaceExchange.address,
      ethers.utils.parseEther('20')
    );
    await approveERC20Tx.wait();

    const setTradableTokenTx = await marketplaceExchange.connect(creator).setTradableTokenAddress(
      custom20.address,
      true
    );
    await setTradableTokenTx.wait();

    const exchangeTx = await marketplaceExchange.connect(seller)['submitOrder((address,address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint8),(uint8,bytes32,bytes32))'](
      order,
      { v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }
    );
    await exchangeTx.wait();

    expect(await custom1155.balanceOf(buyer.address, 0)).to.equal(5);
    expect(await custom1155.balanceOf(seller.address, 0)).to.equal(5);
  });
});