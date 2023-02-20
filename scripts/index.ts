import 'dotenv/config';

import inquirer from 'inquirer';

(async () => {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'chain',
      message: 'Select a chain',
      choices: [
        'klaytn',
        'ethereum',
        'polygon'
      ]
    }
  ]);
})();