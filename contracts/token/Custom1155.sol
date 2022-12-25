// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol';

contract Custom1155 is
  Context,
  AccessControlEnumerable,
  ERC1155Burnable,
  ERC1155Pausable,
  Ownable
{
  event Custom1155Transfer(address indexed from, address indexed to, uint256 indexed id, uint256 amount, uint256 offchainId);

  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');

  string private _baseTokenURI;
  string private _contractURI;

  constructor(
    string memory baseTokenURI,
    string memory contractURI_,
    address creator,
    address minter,
    address txSender
  ) ERC1155('') {
    _baseTokenURI = baseTokenURI;
    _contractURI = contractURI_;

    _setupRole(MINTER_ROLE, minter);

    _setupRole(DEFAULT_ADMIN_ROLE, txSender);
    _setupRole(PAUSER_ROLE, txSender);

    _transferOwnership(creator);
  }

  function _baseURI() internal view virtual returns (string memory) {
    return _baseTokenURI;
  }

  function contractURI() public view returns (string memory) {
    return _contractURI;
  }

  function uri(uint256 tokenId) public view virtual override returns (string memory) {
    return string(abi.encodePacked(_baseURI(), Strings.toString(tokenId))); // .json 붙일지 말지 - 함수로 받을지 말지
  }

  function mint(
    address to,
    uint256 id,
    uint256 amount,
    uint256 offchainId,
    bytes memory data
  ) public virtual {
    require(hasRole(MINTER_ROLE, _msgSender()), 'ERC1155PresetMinterPauser: must have minter role to mint');

    _mint(to, id, amount, data);
    emit Custom1155Transfer(address(0), to, id, amount, offchainId);
  }

  function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public virtual {
    require(hasRole(MINTER_ROLE, _msgSender()), 'must have minter role to mint');

    _mintBatch(to, ids, amounts, data);
  }

  function pause() public virtual {
    require(hasRole(PAUSER_ROLE, _msgSender()), 'must have pauser role to pause');
    _pause();
  }

  function unpause() public virtual {
    require(hasRole(PAUSER_ROLE, _msgSender()), 'must have pauser role to unpause');
    _unpause();
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(AccessControlEnumerable, ERC1155)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual override(ERC1155, ERC1155Pausable) {
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }
}