import { writeFile } from 'fs/promises';
import { resolve } from 'path';

import { abi as ExchangeABI} from '../../artifacts/contracts/marketplace/MarketplaceExchange.sol/MarketplaceExchange.json';

type CreateResultParam = {
  network: string;
  name: string;
  address: string;
};

export const writeResultFile = async ({
  network,
  name,
  address
}: CreateResultParam) => {
  let abi: any[] = [];

  switch (name) {
    case 'exchange':
      abi = ExchangeABI;
      break;
  }

  const result = { address, abi };

  await writeFile(
    resolve(__dirname, `../../output/${network}-${name}.json`),
    JSON.stringify(result, null, 2)
  );
};

