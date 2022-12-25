// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol';

contract Custom721 is 
  Context,
  AccessControlEnumerable,
  ERC721Enumerable,
  ERC721Burnable,
  ERC721Pausable,
  Ownable
{
  event Custom721Transfer(address indexed from, address indexed to, uint256 indexed tokenId, uint256 offchainId);

  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');

  string private _baseTokenURI;
  string private _contractURI;

  constructor(
    string memory name,
    string memory symbol,
    string memory baseTokenURI,
    string memory contractURI_,
    address creator,
    address minter,
    address admin
  ) ERC721(name, symbol) {
    _baseTokenURI = baseTokenURI;
    _contractURI = contractURI_;

    _setupRole(MINTER_ROLE, minter);

    _setupRole(DEFAULT_ADMIN_ROLE, admin);
    _setupRole(PAUSER_ROLE, admin);

    _transferOwnership(creator);
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), 'URI query for nonexistent token');
    return string(abi.encodePacked(_baseURI(), Strings.toString(tokenId))); // .json을 붙일지 말지 - 함수로 받을지 말지
  }

  function mint(address to, uint256 tokenId, uint256 offchainId) public virtual {
    require(hasRole(MINTER_ROLE, _msgSender()), 'must have minter role to mint');
    _mint(to, tokenId);
    emit Custom721Transfer(address(0), to, tokenId, offchainId);
  }

  function pause() public virtual {
    require(hasRole(PAUSER_ROLE, _msgSender()), 'must have pauser role to pause');
    _pause();
  }

  function unpause() public virtual {
    require(hasRole(PAUSER_ROLE, _msgSender()), 'must have pauser role to unpause');
    _unpause();
  }

  function contractURI() public view returns (string memory) {
    return _contractURI;
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId,
    uint256 batchSize
  ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(AccessControlEnumerable, ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}