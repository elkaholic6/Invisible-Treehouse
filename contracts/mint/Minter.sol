// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "../interfaces/IMinter.sol";
import "../extensions/Ownable.sol";
import "../extensions/OperatorFilter.sol";

import "../marketplace/NFTMarketplace.sol";

contract Minter is ERC1155, IMinter, Ownable, OperatorFilter, ERC1155Burnable, ERC1155Supply, IERC2981 {
    // using Counters for Counters.Counter;
    


    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||          STATE VARIABLES         ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/
    NFTMarketplace public nftmarketplace;

    uint256 public maxSupply;
    uint256 public royaltyFee;
    uint32 private tokenIdCounter;

    address public royaltyFeeRecipient;

    string public name;
    string public symbol;



    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||              MAPPINGS            ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    mapping(address => bool) private operatorCanSetOwnerOnERC1155;
    mapping(address => bool) private operatorCanSetOwnerOnOwnable;
    mapping(address => bool) private allowedOperators;
    /// @dev It is necessary to use a uint256 because of the 'id' parameter required in _safeTransferFrom, even though the tokenId of this contract will only ever be a 0 or 1.
    // mapping(uint256 => address) private tokenIdToOwner;




    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||              EVENTS              ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    event NFTMinterDeployed(
        address minterContract, 
        address tokenCreator, 
        uint256 maxSupply, 
        uint256 amountMinted, 
        uint256 tokenId
    );



    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||            CONSTRUCTOR           ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/
    constructor(
        string memory initialURI,
        NFTMarketplace _nftmarketplace, 
        uint256 _maxSupply, 
        string memory _name, 
        string memory _symbol,
        uint256 _royaltyFee
        ) ERC1155(initialURI) {
            require(_royaltyFee <= 1000, "Royalty fees cannot exceed 1,000 bps");
            require(_royaltyFee >= 0, "Royalty fees cannot be negative");
            require(_maxSupply <= 100000, "Max supply cannot exceed 10,000");
            nftmarketplace = _nftmarketplace;
            maxSupply = _maxSupply;
            name = _name;
            symbol = _symbol;
            royaltyFee = _royaltyFee;
            royaltyFeeRecipient = owner();
        }



    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||          PUBLIC FUNCTIONS        ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    /**
     * @notice Sets the URI for the NFT
     * 
     * @param newuri The new URI for the NFT
     */
    function setURI(string memory newuri) 
        public 
        onlyOwner 
    {
        _setURI(newuri);
    }

    /**
     * @notice Mints NFTs to the owner. This function must only be called once.
     * 
     * @param amount The amount of NFTs to mint
     */
    function mint(uint256 amount)
        external
        payable
        onlyOwner
    {
        // require(msg.value == price * amount, "Please send the exact amount");
        require(amount > 0, "Must mint at least 1 NFT");
        require(tokenIdCounter == 0, "Already minted NFTs. Must deploy new contract to mint more");
        require(totalSupply(tokenIdCounter + 1) + amount <= maxSupply, "Sorry, that exceeds the max supply");

        tokenIdCounter = tokenIdCounter + 1;
        uint32 _tokenIdCounter = tokenIdCounter;
        
        _mint(msg.sender, _tokenIdCounter, amount, "");
        nftmarketplace.addTokensFromMinter(msg.sender, address(this));
        // tokenIdToOwner[_tokenIdCounter] = msg.sender;

        emit NFTMinterDeployed(address(this), msg.sender, maxSupply, amount, _tokenIdCounter);
    }

    /**
     * @notice Grants or revokes permission to `operator` to transfer the caller's tokens on the ERC1155 contract, according to `approved`
     * 
     * @param operator The address of the operator.
     * @param approved Whether or not the operator is allowed to set the owner of the NFT
     */
    function setApprovalForAll(address operator, bool approved) 
        public 
        override 
        // onlyAllowedOperator(operator) 
    {
        super.setApprovalForAll(operator, approved);
        operatorCanSetOwnerOnERC1155[operator] = approved;
    }

    /**
     * @notice Checks if `operator` is allowed to transfer the caller's tokens on the ERC1155 contract
     * 
     * @param account The address of the original owner
     * @param operator The address to check if approved
     */
    function isApprovedForAll(address account, address operator) 
        public 
        view 
        override 
        returns (bool) 
    {
        return super.isApprovedForAll(account, operator);
    }

    /**
     * @notice Sets the owner of the NFT on the Ownable contract.  Can only be called by the current contract owner
     * 
     * @param operator The address of  operator to set
     * @param approved Whether or not the operator is allowed to set the owner of the NFT on the Ownable contract
     */
    function setApproval(address operator, bool approved) 
        public 
        override 
        onlyOwner 
    {
        super.setApproval(operator, approved);
        operatorCanSetOwnerOnOwnable[operator] = approved;
    }


    /**
     * @notice Allows `operator` to transfer ownership of NFT.  Can only be called by the current contract owner.  If an operator is not allowed to transfer ownership of NFT, any function that uses the onlyAllowedOperator modifier will revert with "Operator not allowed".
     * 
     * @param operator The address of the `operator` to be allowed to transfer ownership of NFT
     */
    function addAllowedOperator(address operator) 
        public
        override 
        onlyOwner 
    {
        allowedOperators[operator] = true;
    }

    /**
     * @notice Removes `operator` from having the ability to transfer ownership of NFT.  Can only be called by the current contract owner.
     * 
     * @param operator The address of the `operator` to be removed from having the ability to transfer ownership of NFT
     */
    function removeAllowedOperator(address operator) 
        public
        override 
        onlyOwner 
    {
        allowedOperators[operator] = false;
    }

    /**
     * @notice Returns whether or not the operator is allowed to transfer the caller's tokens on the ERC1155 contract
     * 
     * @param operator The address of the operator
     */
    function isAllowedOperator(address operator) public view override returns (bool) {
        return allowedOperators[operator];
    }

    /**
     * @notice Checks if `operator` is allowed to transfer the caller's tokens on the Ownable contract
     * 
     * @param account The address of the current owner
     * @param operator The address to check if approved
     */
    function isApproved(address account, address operator) 
        public
        view 
        override 
        returns (bool) 
    {
        return super.isApproved(account, operator);
    }

    function setRoyalties(address newRecipient) external onlyOwner {
        _setRoyalties(newRecipient);
}




    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||        INTERNAL FUNCTIONS        ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning, as well as batched variants.
     */
    function _beforeTokenTransfer(
        address operator, 
        address from, 
        address to, 
        uint256[] memory ids, 
        uint256[] memory amounts, 
        bytes memory data
    )
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    /**
     * @notice Transfers an NFT.  This is used to update the owner of the NFT on this contract through tokenIdToOwner
     * 
     * @param from Address being transferred from
     * @param to Address being transferred to
     * @param id The id of the NFT
     * @param amount The amount of the NFT
     * @param data The data of the NFT
     */
    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual override {

        super._safeTransferFrom(from, to, id, amount, data);
        
        // tokenIdToOwner[id] = to;
    }

    function _setRoyalties(address newRecipient) internal {
        require(newRecipient != address(0), "Royalties: new recipient is the zero address");
        royaltyFeeRecipient = newRecipient;
}




    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||          VIEW FUNCTIONS          ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view override returns (address receiver, uint256 royaltyAmount) {
        return (royaltyFeeRecipient, (_salePrice * royaltyFee) / 10000);
}

    /**
     * @notice Returns the total supply of the NFTs
     */
    function getMaxSupply() external view returns (uint256) {
        return maxSupply;
    }


    /**
     * @notice Returns the owner of the contract
     */
    function getOwner() external view returns (address) {
        return owner();
    }

    /**
     * @notice Returns the total supply of the NFTs of a given tokenId
     */
    function getTotalMinted(uint256 id) external view returns (uint256) {
        return totalSupply(id);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, IERC165) returns (bool) {
        return (interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId));
    }

}