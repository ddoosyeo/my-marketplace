import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('FactoryOf1155 test', () => {
  const deployFixture = async () => {
    const [owner, creator, minter, admin] = await ethers.getSigners();

    const BASE_URL = 'http://test.com/';
    const CONTRACT_URI = 'http://test.com/';
    const CREATOR_ADDRESS = creator.address;
    const MINTER_ADDRESS = minter.address;
    const ADMIN_ADDRESS = admin.address;

    const FactoryOf1155Factory = await ethers.getContractFactory('FactoryOf1155');
    const factoryOf1155 = await FactoryOf1155Factory.deploy();

    const FactoryRouterFactory = await ethers.getContractFactory('FactoryRouter');
    const factoryRouter = await FactoryRouterFactory.deploy(
      factoryOf1155.address,
      factoryOf1155.address
    );

    return {
      owner, creator, minter, admin,
      BASE_URL, CONTRACT_URI, CREATOR_ADDRESS, MINTER_ADDRESS,
      ADMIN_ADDRESS, factoryOf1155, factoryRouter
    };
  }
  it('create1155Token event', async () => {
    const {
      BASE_URL, CONTRACT_URI, CREATOR_ADDRESS, MINTER_ADDRESS,
      ADMIN_ADDRESS, factoryRouter
    } = await loadFixture(deployFixture);
    
    await expect(factoryRouter.create1155Token(
      BASE_URL,
      CONTRACT_URI,
      CREATOR_ADDRESS,
      MINTER_ADDRESS,
      ADMIN_ADDRESS
    )).to.emit(factoryRouter, 'Create1155Token')
      .withArgs(
        ethers.utils.isAddress, 
        BASE_URL, 
      );
  });

  it('create1155Token that created by create1155Token basic test', async () => {
    const {
      creator, minter, admin,
      BASE_URL, CONTRACT_URI, CREATOR_ADDRESS, MINTER_ADDRESS,
      ADMIN_ADDRESS, factoryRouter
    } = await loadFixture(deployFixture);
    
    const tx = await factoryRouter.create1155Token(
      BASE_URL,
      CONTRACT_URI,
      CREATOR_ADDRESS,
      MINTER_ADDRESS,
      ADMIN_ADDRESS
    );

    const receipt = await tx.wait();

    // @ts-ignore
    const event = receipt.events?.filter((x) => {return x.event == 'Create1155Token'})[0];
    const nftAddress = event!.args![0];

    const custom1155 = await ethers.getContractAt('Custom1155', nftAddress);

    const tx1 = await custom1155.connect(minter).mint(creator.address, 0, 10, 0, []);
    const tx2 = await custom1155.connect(minter).mint(admin.address, 1, 20, 0, []);
    await tx1.wait();
    await tx2.wait();

    expect(await custom1155.contractURI()).to.be.eq(CONTRACT_URI);
    expect(await custom1155.owner()).to.be.eq(CREATOR_ADDRESS);
    expect(await custom1155.balanceOf(creator.address, 0)).to.be.eq(10);
    expect(await custom1155.balanceOf(admin.address, 0)).to.be.eq(0);
    expect(await custom1155.balanceOf(admin.address, 1)).to.be.eq(20);
  });
});