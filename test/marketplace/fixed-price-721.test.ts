import { ethers, web3 } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { create721Hash, create721Order } from '../utils/create-hash';

describe('fixed price 721 order exchange test', () => {
  const deployFixture = async () => {
    const [creator, minter, manager, seller, buyer, feeReceiver] = await ethers.getSigners();

    const NAME = 'Marketplace721';
    const SYMBOL = 'C721';
    const BASE_URL = 'http://test.com/';
    const CONTRACT_URI = BASE_URL;
    const CREATOR_ADDRESS = creator.address;
    const MINTER_ADDRESS = minter.address;
    const MANAGER_ADDRESS = manager.address;

    const Custom721Factory = await ethers.getContractFactory('Custom721');
    const custom721 = await Custom721Factory.deploy(
      NAME,
      SYMBOL,
      BASE_URL,
      CONTRACT_URI,
      CREATOR_ADDRESS,
      MINTER_ADDRESS,
      MANAGER_ADDRESS
    );

    const Custom20Factory = await ethers.getContractFactory('Custom20');
    const custom20 = await Custom20Factory.deploy('F20', 'F20');

    const mintTx = await custom20.mint(buyer.address, ethers.utils.parseEther('100'));
    await mintTx.wait();

    const MarketplaceExchangeFactory = await ethers.getContractFactory('MarketplaceExchange');
    const marketplaceExchange = await MarketplaceExchangeFactory.deploy();

    await marketplaceExchange.setFeeAddress(feeReceiver.address);
    await marketplaceExchange.setMarketplaceFee(1000);
    await marketplaceExchange.setSignPrefix(0, '\x19Klaytn Signed Message:\n');
    await marketplaceExchange.setSignPrefix(1, '\x19Ethereum Signed Message:\n');

    return { custom721, custom20, marketplaceExchange, creator, minter, seller, buyer }
  }

  it('order length must be equal signature length' , async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0]
    });

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order, order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.revertedWith('MarketplaceExchange: orders length must be equal signatures length');
  });

  it('order must be more than one', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0]
    });

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [],
      [],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.revertedWith('MarketplaceExchange: orders is require');
  });

  it('total order amount and message value must match', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('2')
      }
    )).to.be.revertedWith('MarketplaceExchange: value is not matched');
  });

  it('signer and seller addresses must match', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, buyer.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.be.revertedWith('MarketplaceOrderVerifier: signer not matched or order not matched');
  });

  it('can only be sold before the sale expiration date has passed', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    order.saleExpireTimestamp = Math.round(new Date('2022-10-01T09:00:00.000Z').getTime() / 1000);

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.be.revertedWith('MarketplaceOrderVerifier: already expired order');
  });

  it('when there is a reserve buyer, it must match the buyer', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    order.reserveBuyer = custom721.address;

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.be.revertedWith('MarketplaceOrderVerifier: reserve buyer not matched');
  });

  it('exchange address must be non-zero', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: ethers.constants.AddressZero,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.be.revertedWith('MarketplaceOrderVerifier: exchangeContract address must be not zero');
  });

  it('Seller and message sender must match when canceling an order', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: ethers.constants.AddressZero,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    await expect(marketplaceExchange.connect(buyer)['cancelOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8))'](
      order
    )).to.be.revertedWith('MarketplaceExchange: message sender must be equal seller.');
  });

  it('Canceled orders must be reverted', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: ethers.constants.AddressZero,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    });

    const cancelTx = await marketplaceExchange.connect(seller)['cancelOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8))'](order);
    await cancelTx.wait();

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.be.revertedWith('MarketplaceOrderVerifier: already cancel order');
  });

  it('orders that have already been sold must be reverted', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    })

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    const exchangeTx = await marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    );
    await exchangeTx.wait();

    expect(await custom721.balanceOf(buyer.address)).to.equal(1);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    )).to.be.revertedWith('MarketplaceOrderVerifier: already sold order');
  });

  it('when purchasing with ERC20 tokens, you can only trade with tokens registered as tradable tokens', async () => {
    const { custom721, custom20, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approve721Tx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approve721Tx.wait();

    const approve20Tx = await custom20.connect(buyer).approve(
      marketplaceExchange.address,
      ethers.utils.parseEther('10')
    );
    await approve20Tx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: custom20.address,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    })

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    await expect(marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }]
    )).to.be.revertedWith('MarketplacePaymentManager: impossible transfer token type');
  });

  it('purchasing one token in ether with a normal order must succeed', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    })

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    const exchangeTx = await marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    );
    await exchangeTx.wait();

    expect(await custom721.balanceOf(buyer.address)).to.equal(1);
  });

  it('purchasing one token in ERC20 with a normal order must succeed', async () => {
    const { custom721, custom20, marketplaceExchange, creator, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx.wait();

    const approve721Tx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approve721Tx.wait();

    const approve20Tx = await custom20.connect(buyer).approve(
      marketplaceExchange.address,
      ethers.utils.parseEther('10')
    );
    await approve20Tx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: custom20.address,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0],
    })

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    const setTradableTokenTx = await marketplaceExchange.connect(creator).setTradableTokenAddress(custom20.address, true);
    await setTradableTokenTx.wait();

    const exchangeTx = await marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }]
    );
    await exchangeTx.wait();

    expect(await custom721.balanceOf(buyer.address)).to.equal(1);
  });

  it('purchasing bundle in ether with a normal order must succeed', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx_1 = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx_1.wait();

    const mintTx_2 = await custom721.connect(minter).mint(seller.address, 1, 0);
    await mintTx_2.wait();

    const mintTx_3 = await custom721.connect(minter).mint(seller.address, 2, 0);
    await mintTx_3.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0, 1, 2],
    })

    const hash = create721Hash(order);

    const sellSignature = await web3.eth.sign(hash, seller.address);
    const splitSignature = ethers.utils.splitSignature(sellSignature);

    const exchangeTx = await marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order ],
      [{ v: splitSignature.v, r: splitSignature.r, s: splitSignature.s }],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('1')
      }
    );
    await exchangeTx.wait();

    expect(await custom721.balanceOf(buyer.address)).to.equal(3);
  });

  it('purchasing multi token in ether with a normal order must succeed', async () => {
    const { custom721, marketplaceExchange, minter, seller, buyer } = await loadFixture(deployFixture);

    const mintTx_1 = await custom721.connect(minter).mint(seller.address, 0, 0);
    await mintTx_1.wait();

    const mintTx_2 = await custom721.connect(minter).mint(seller.address, 1, 0);
    await mintTx_2.wait();

    const mintTx_3 = await custom721.connect(minter).mint(seller.address, 2, 0);
    await mintTx_3.wait();

    const approveTx = await custom721.connect(seller).setApprovalForAll(marketplaceExchange.address, true);
    await approveTx.wait();

    const order_1 = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [0]
    });

    const order_2 = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [1]
    });

    const order_3 = create721Order({
      royaltyReceiver: seller.address,
      seller: seller.address,
      exchangeContract: custom721.address,
      paymentToken: ethers.constants.AddressZero,
      reserveBuyer: ethers.constants.AddressZero,
      tokenIds: [2]
    });

    const hash_1 = create721Hash(order_1);
    const hash_2 = create721Hash(order_2);
    const hash_3 = create721Hash(order_3);

    const sellSignature_1 = await web3.eth.sign(hash_1, seller.address);
    const splitSignature_1 = ethers.utils.splitSignature(sellSignature_1);

    const sellSignature_2 = await web3.eth.sign(hash_2, seller.address);
    const splitSignature_2 = ethers.utils.splitSignature(sellSignature_2);

    const sellSignature_3 = await web3.eth.sign(hash_3, seller.address);
    const splitSignature_3 = ethers.utils.splitSignature(sellSignature_3);

    const exchangeTx = await marketplaceExchange.connect(buyer)['submitOrder((address,address,address,address,address,uint256[],uint256,uint256,uint256,bytes,uint8)[],(uint8,bytes32,bytes32)[])'](
      [ order_1, order_2, order_3 ],
      [
        { v: splitSignature_1.v, r: splitSignature_1.r, s: splitSignature_1.s },
        { v: splitSignature_2.v, r: splitSignature_2.r, s: splitSignature_2.s },
        { v: splitSignature_3.v, r: splitSignature_3.r, s: splitSignature_3.s }
      ],
      {
        from: buyer.address,
        value: ethers.utils.parseEther('3')
      }
    );
    await exchangeTx.wait();

    expect(await custom721.balanceOf(buyer.address)).to.equal(3);
  });
})