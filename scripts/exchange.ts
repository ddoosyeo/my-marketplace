import { ethers } from 'hardhat';
import inquirer from 'inquirer';
import env from 'env-var';
import { Address } from 'hardhat-deploy/dist/types';
import { writeResultFile } from './utils';

const BAOBAB_ENDPOINT = env.get('BAOBAB_ENDPOINT').required().asString();
const CYPRESS_ENDPOINT = env.get('CYPRESS_ENDPOINT').required().asString();

const PRIVATE_KEY = env.get('PRIVATE_KEY').required().asString();

type ExchangeDeployerParam = {
  network: string;
  proxyAddress: Address;
};

const exchangeDeployer = async ({
  network,
  proxyAddress
}: ExchangeDeployerParam) => {
  ethers.provider = new ethers.providers.JsonRpcProvider(
    network === 'cypress' ? CYPRESS_ENDPOINT : BAOBAB_ENDPOINT
  );

  const ownerWallet = new ethers.Wallet(PRIVATE_KEY, ethers.provider);
  const gasPrice = ethers.provider.getGasPrice();

  console.log(`started deploying exchange in ${network} network`);

  const ExchangeFactory = await ethers.getContractFactory('MarketplaceExchange');
  const exchange = await ExchangeFactory.connect(ownerWallet).deploy({ gasPrice });
  const deployedExchange = await exchange.deployed();

  console.log(
    `created exchange address in ${network} network: ${deployedExchange.address}`
  );

  await writeResultFile({
    network,
    name: 'exchange',
    address: exchange.address
  });
}