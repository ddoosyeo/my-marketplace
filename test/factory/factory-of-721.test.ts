import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('FactoryOf721 test', () => {
  const deployFixture = async () => {
    const [owner, creator, minter, admin] = await ethers.getSigners();

    const NAME = 'MY_721_TOKEN';
    const SYMBOL = 'MY721';
    const BASE_URL = 'http://test.com/';
    const CONTRACT_URI = BASE_URL;
    const CREATOR_ADDRESS = creator.address;
    const MINTER_ADDRESS = minter.address;
    const ADMIN_ADDRESS = admin.address;

    const FactoryOf721Factory = await ethers.getContractFactory('FactoryOf721');
    const factoryOf721 = await FactoryOf721Factory.deploy();

    const FactoryRouterFactory = await ethers.getContractFactory('FactoryRouter');
    const factoryRouter = await FactoryRouterFactory.deploy(
      factoryOf721.address,
      factoryOf721.address
    );

    return { 
      owner, creator, minter, admin,
      NAME, SYMBOL, BASE_URL, CONTRACT_URI, 
      CREATOR_ADDRESS, MINTER_ADDRESS, ADMIN_ADDRESS,
      factoryOf721, factoryRouter
    }
  }

  it('create721Token event', async () => {
    const { 
      NAME, SYMBOL, BASE_URL, CONTRACT_URI, 
      CREATOR_ADDRESS, MINTER_ADDRESS, ADMIN_ADDRESS,
      factoryRouter
    } = await loadFixture(deployFixture);
    
    await expect(
      factoryRouter.create721Token(
        NAME,   
        SYMBOL,       
        BASE_URL,
        CONTRACT_URI,
        CREATOR_ADDRESS,
        MINTER_ADDRESS,
        ADMIN_ADDRESS
      )
    )
    .to.be.emit(factoryRouter, 'Create721Token')
    .withArgs(
      ethers.utils.isAddress, 
      NAME, 
      SYMBOL, 
    );
  });

  it('custom721 token that created by create721Token basic', async () => {
    const { 
      minter, admin, factoryRouter,
      NAME, SYMBOL, BASE_URL, CONTRACT_URI, 
      CREATOR_ADDRESS, MINTER_ADDRESS, ADMIN_ADDRESS
    } = await loadFixture(deployFixture);
      
    const tx = await factoryRouter.create721Token(
      NAME,   
      SYMBOL,       
      BASE_URL,
      CONTRACT_URI,
      CREATOR_ADDRESS,
      MINTER_ADDRESS,
      ADMIN_ADDRESS
    );
    const receipt = await tx.wait();

    // @ts-ignore
    const event = receipt.events?.filter((x) => {return x.event == "Create721Token"})[0];
    const nftAddress = event!.args![0];

    const Custom721Factory = await ethers.getContractFactory('Custom721');
    const custom721 = Custom721Factory.attach(nftAddress);

    const [tx1, tx2] = await Promise.all([
      custom721.connect(minter).mint(admin.address, 0, 0),
      custom721.connect(minter).mint(admin.address, 1, 1)
    ]);
    
    await Promise.all([
      tx1.wait(),
      tx2.wait()
    ])

    expect(await custom721.name()).to.be.eq(NAME);
    expect(await custom721.symbol()).to.be.eq(SYMBOL);
    expect(await custom721.contractURI()).to.be.eq(CONTRACT_URI);
    expect(await custom721.owner()).to.be.eq(CREATOR_ADDRESS);
    expect(await custom721.tokenURI(0)).to.be.eq(BASE_URL.concat('0'));
    expect(await custom721.tokenURI(1)).to.be.eq(BASE_URL.concat('1'));
  });
});