import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Custom721 test', () => {
  it('Custom721 basic test', async () => {
    const [owner, creator, manager, minter, user1, user2] = await ethers.getSigners();

    const NAME = 'CustomTokenFactory';
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

    const [tx_1, tx_2] = await Promise.all([
      custom721.connect(minter).mint(user1.address, 0, 0),
      await custom721.connect(minter).mint(user1.address, 1, 1)
    ])

    await Promise.all([
      tx_1.wait(),
      tx_2.wait()
    ]);

    expect(await custom721.name()).to.be.eq(NAME);
    expect(await custom721.symbol()).to.be.eq(SYMBOL);
    expect(await custom721.contractURI()).to.be.eq(CONTRACT_URI);
    expect(await custom721.owner()).to.be.eq(CREATOR_ADDRESS);
    expect(await custom721.tokenURI(0)).to.be.eq(BASE_URL.concat('0'));
    expect(await custom721.tokenURI(1)).to.be.eq(BASE_URL.concat('1'));
  });
});