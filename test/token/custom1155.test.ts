import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Custom1155 test', () => {
  it('Custom1155 basic test', async () => {
    const [owner, creator, manager, minter, user1, user2] = await ethers.getSigners();

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

    const [tx_1, tx_2] = await Promise.all([
      custom1155.connect(minter).mint(user1.address, 0, 10, 0, []),
      custom1155.connect(minter).mint(user2.address, 1, 20, 0, [])
    ]);

    await Promise.all([
      tx_1.wait(),
      tx_2.wait()
    ]);

    expect(await custom1155.contractURI()).to.be.eq(CONTRACT_URI);
    expect(await custom1155.owner()).to.be.eq(CREATOR_ADDRESS);
    expect(await custom1155.balanceOf(user1.address, 0)).to.be.eq(10);
    expect(await custom1155.balanceOf(user2.address, 0)).to.be.eq(0);
    expect(await custom1155.balanceOf(user2.address, 1)).to.be.eq(20);
  });
});