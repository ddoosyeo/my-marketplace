// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol';

contract Custom20 is ERC20PresetMinterPauser {
  constructor(string memory name, string memory symbol)
    ERC20PresetMinterPauser(name, symbol) {}
}