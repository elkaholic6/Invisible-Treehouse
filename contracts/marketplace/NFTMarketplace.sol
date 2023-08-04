// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "../interfaces/INFTMarketplace.sol";
import "../interfaces/IMinter.sol";

import "../mint/Minter.sol";

import "../extensions/Ownable.sol";

import "../Treasury.sol";

contract NFTMarketplace is INFTMarketplace, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    



    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||          STATE VARIABLES         ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    ERC1155 private erc1155Contract;
    Treasury treasury = new Treasury();
    address treasuryContractAddress = address(treasury);
    Counters.Counter private listingId;
    Counters.Counter private mintedTokens;



    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||             MAPPINGS             ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    mapping(address => uint256) public minterAddressToTokenIds;
    mapping(uint256 => Listing) private idToListing;
    /// @notice Minter contract => address of lister => balances listed
    mapping(address => mapping(address => uint256)) public ownerBalancesListed;
    mapping(address => bool) internal isUpdatingListing;
    mapping(address => address[]) public tokensOwned;




    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||        EXTERNAL FUNCTIONS        ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    /** 
     *  @notice The function that allows owners to list NFTs.
     *
     *  @param _params The parameters that were passed to the function.  This is a ListingParameters object from INFTMarketplace
     */
    function listToken(ListingParameters calldata _params) public payable nonReentrant {
        IMinter _minterContract;
        _minterContract = IMinter(_params.minterContract);

        ERC1155 _erc1155Contract;
        _erc1155Contract = ERC1155(_params.minterContract);
        require(_erc1155Contract.isApprovedForAll(_minterContract.getOwner(), address(this)), "NFTMarketplace: Operator not approvedForAll to transfer NFTs");
        TokenType tokenType = _getTokenType(_params.minterContract);
        require (tokenType == TokenType.ERC1155, "Only ERC-1155 supported");

        if(!isUpdatingListing[msg.sender]){
            uint256 balance = _erc1155Contract.balanceOf(msg.sender, _params.tokenId);
            uint256 available = _getAmountAvailableToList(address(_minterContract), balance);
            require(available >= _params.quantity, "Cannot list more than owned"); 

            ownerBalancesListed[address(_minterContract)][msg.sender] += _params.quantity;  
        }
        

        listingId.increment();
        uint256 _listingId = listingId.current();
        mintedTokens.increment();
        
        Listing memory listing = Listing({
            listingCreator: msg.sender,
            minterContract: _params.minterContract,
            tokenId: _params.tokenId,
            listingId: _listingId,
            quantity: _params.quantity,
            pricePerToken: _params.pricePerToken,
            currentlyListed: _params.currentlyListed
        });

        idToListing[_listingId] = listing;

        emit NewListing(
            msg.sender, 
            _params.minterContract, 
            _params.tokenId, 
            _listingId,
            _params.quantity, 
            _params.pricePerToken, 
            _params.currentlyListed
            );
    }

    function cancelListing(address minterContract, uint256 _listingId, uint256 _quantity) public {
        IMinter _minterContract;
        _minterContract = IMinter(minterContract);

        Listing storage listing = idToListing[_listingId];
        require(listing.currentlyListed == true, "Listing is not currently listed");
        require(listing.listingCreator == msg.sender, "Cannot cancel listing if not owner");
        require(listing.quantity >= _quantity, "Insufficient balance, cannot cancel that amount");
        require(_quantity > 0, "Quantity must be greater than 0");

        if(listing.quantity == _quantity) {
            listing.currentlyListed = false;
        }

        listing.quantity = listing.quantity - _quantity;
        ownerBalancesListed[address(_minterContract)][msg.sender] -= _quantity;

        emit CancelledListing(
            msg.sender,
            minterContract,
            listing.tokenId,
            _listingId,
            _quantity
        );
    }

    /**
     * @notice Allows for users to update listings
     * 
     * @param _params ListingParameters
     * @param _listingId The id of the listing
     */
    function updateListing(ListingParameters calldata _params, uint256 _listingId) external payable {
        Listing storage listing = idToListing[_listingId];
        require(listing.currentlyListed == true, "Listing is not currently listed");
        require(msg.sender == listing.listingCreator, "Only listing creator can update listing");
        require(_params.currentlyListed == true, "Must cancel listing to set currentlyListed to false");
        require(_params.quantity > 0, "Quantity must be greater than 0");
        require(_params.quantity <= listing.quantity, "Quantity must be less than or equal to amount listed");
        require(_params.pricePerToken > 0, "Price must be greater than 0");
        require(_params.tokenId == listing.tokenId, "Token ID must match token ID of listing");
        require(_params.minterContract == listing.minterContract, "Minter contract must match minter contract of listing");

        if(_params.quantity == listing.quantity) {
            listing.pricePerToken = _params.pricePerToken;
        } 

        if(_params.quantity != listing.quantity) {
            //Must create a new listing for the updated quantity
            isUpdatingListing[msg.sender] = true;
            mintedTokens.increment();
            listToken(_params);
            isUpdatingListing[msg.sender] = false;

            uint256 remainingListings = listing.quantity - _params.quantity;
            listing.quantity = remainingListings;
            listing.pricePerToken = listing.pricePerToken;
        } 

        emit UpdatedListing(
            msg.sender,
            _params.minterContract,
            _params.tokenId,
            _listingId,
            _params.quantity,
            _params.pricePerToken,
            true
        );
    }

    /** 
     *  @notice Allows for users to buy listed NFTs.
     *
     *  @param _listingId The tokenId of the NFT being bought.
     *  @param _buyFor The address of the buyer.
     *  @param _quantity The quantity of NFTs being bought.
     */
    function buyListedToken(
        uint256 _listingId,
        address _buyFor,
        uint256 _quantity
    ) external payable nonReentrant {
        Listing storage listing = idToListing[_listingId];
        IMinter _minterContract;
        _minterContract = IMinter(listing.minterContract);
        require(listing.currentlyListed == true, "Listing is not currently listed");
        require(_quantity > 0, "Cannot buy 0 tokens");
        require(_quantity <= listing.quantity, "Cannot buy more than listing quantity");
        uint256 targetTotalPrice = listing.pricePerToken * _quantity;
        require(msg.sender.balance >= msg.value, "Insufficient balance");
        require(msg.value == targetTotalPrice, "Please send the exact amount");

        if(listing.quantity != _quantity) {
            uint256 remainingListings = listing.quantity - _quantity;
            listing.quantity = remainingListings;
        } else {
            listing.currentlyListed = false;
            listing.quantity = 0;
        }
        
        _payout(listing.listingCreator, targetTotalPrice, listing);
        _checkAndUpdateTokensOwned(address(_minterContract), listing.listingCreator, _buyFor, _quantity);
        _transferListingTokens(address(_minterContract), listing.listingCreator, _buyFor, _quantity, listing);

        emit NewSale(
            listing.listingCreator,
            listing.minterContract,
            _buyFor,
            listing.tokenId,
            _quantity,
            listing.pricePerToken
        );
    }

    function addTokensFromMinter(address _sender, address _minterContract) external {
        require(msg.sender == _minterContract, "Only minter contract can add tokens");
        _addTokens(_sender, _minterContract);
    }

    /**
     * @notice Sets the ERC1155 contract.
     * 
     * @param erc1155Address The address of the ERC1155 contract.
     */
    function setERC1155Contract(address erc1155Address) public {
        erc1155Contract = ERC1155(erc1155Address);
    }





    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||        INTERNAL FUNCTIONS        ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    /**
     * @notice Transfers the ether between buyer and seller.  Also transfers the NFT to the buyer
     * 
     * @param _recipient The address of the recipient. 
     * @param _totalPayoutAmount The total amount of ether to be transferred.
     * @param _listing The listing object from INFTMarketplace
     */
    function _payout(
        address _recipient,
        uint256 _totalPayoutAmount,
        Listing memory _listing
    ) internal {
        //Platformfeecut should be 2.5%
        uint256 platformFeeCut = (_totalPayoutAmount * 250) / 10_000;

        uint256 royaltyCut;
        address payable royaltyRecipient;

        try IERC2981(_listing.minterContract).royaltyInfo(_listing.tokenId, _totalPayoutAmount) returns (
            address royaltyFeeRecipient,
            uint256 royaltyFeeAmount
        ) {
            if (royaltyFeeRecipient != address(0) && royaltyFeeAmount > 0) {
                require(royaltyFeeAmount <= _totalPayoutAmount, "fees exceed the price");
                royaltyRecipient = payable(royaltyFeeRecipient);
                royaltyCut = royaltyFeeAmount;
            }
        } catch {}
        
        // console.log(platformFeeCut, royaltyCut, _totalPayoutAmount);
        _safeTransfer(payable(treasuryContractAddress), platformFeeCut);
        _safeTransfer(payable(royaltyRecipient), royaltyCut);
        _safeTransfer(payable(_recipient), _totalPayoutAmount - (platformFeeCut + royaltyCut));
    }

    /**
     * @notice Transfers ownership of the NFT
     * 
     * @param _from The address of the original owner
     * @param _to The recipient
     * @param _quantity The quantity of NFTs
     * @param _listing The listing object from INFTMarketplace
     */
    function _transferListingTokens(
        address _minterContract,
        address _from,
        address _to,
        uint256 _quantity,
        Listing memory _listing
    ) internal {
        
        ownerBalancesListed[_minterContract][_from] -= _quantity;
        IERC1155(_listing.minterContract).safeTransferFrom(
            _from,
            _to,
            _listing.tokenId,
            _quantity,
            ""
        );
    }

    /**
     * @notice Transfers the ether between buyer and seller as well as the royalty recipient
     * 
     * @param to The address of the recipient
     * @param _value The amount of ether to be transferred
     */
    function _safeTransfer(address payable to, uint256 _value) internal {
        (bool success, ) = payable(to).call{ value: _value }("");
        require(success, "ether transfer failed");
    }

    /**
     * @dev Returns the interface supported by a contract.  Should only be ERC1155
     */ 
    function _getTokenType(address _minterContract) internal view returns (TokenType tokenType) {
        if (IERC165(_minterContract).supportsInterface(type(IERC1155).interfaceId)) {
            tokenType = TokenType.ERC1155;
        } else {
            revert("Marketplace: listed token must be ERC1155.");
        }
    }

    function _getAmountAvailableToList(address _minterContract, uint256 _balance) public view returns (uint256) {
        if(ownerBalancesListed[_minterContract][msg.sender] == 0) {
            return _balance;
        }
        return _balance - ownerBalancesListed[_minterContract][msg.sender];
    }

    function _addTokens(address _sender, address _minterContract) internal {
        tokensOwned[_sender].push(_minterContract);
        mintedTokens.increment();
    }

    function _checkAndUpdateTokensOwned(address _minterContract, address _owner, address _to, uint256 _quantity) internal {
        ERC1155 _erc1155Contract;
        _erc1155Contract = ERC1155(_minterContract);
        uint256 ownerBalance = _erc1155Contract.balanceOf(_owner, 1);
        require(ownerBalance >= _quantity, "Insufficient balance");

        bool foundInBuyerTokens = false;

        if (ownerBalance - _quantity == 0) {
            address[] storage ownerTokens = tokensOwned[_owner];
            for (uint256 i = 0; i < ownerTokens.length; ++i) {
                if (ownerTokens[i] == _minterContract) {
                    if (i != ownerTokens.length - 1) {
                        // Swap with the last element
                        ownerTokens[i] = ownerTokens[ownerTokens.length - 1];
                    }
                    // Pop the last element
                    ownerTokens.pop();
                    break;
                }
            }
        }

        address[] memory buyerOwnedTokens = tokensOwned[_to];
        for (uint256 i = 0; i < buyerOwnedTokens.length; ++i) {
            if (buyerOwnedTokens[i] == _minterContract) {
                foundInBuyerTokens = true;
                break;
            }
        }
        if(!foundInBuyerTokens) {
            tokensOwned[_to].push(_minterContract);
        }

        mintedTokens.increment();
        listingId.increment();
        uint256 _listingId = listingId.current();

        Listing memory listing = Listing({
            listingCreator: _to,
            minterContract: _minterContract,
            tokenId: 1,
            listingId: _listingId,
            quantity: _quantity,
            pricePerToken: 0,
            currentlyListed: false
        });

        idToListing[_listingId] = listing;
    }



    /*~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%
    ||          VIEW FUNCTIONS          ||
    ~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%~%*/

    /**
     * @notice Returns all listed NFTs
     */ 
    function displayAllListedNfts() external view returns (Listing[] memory) {
        uint256 currentlyListedNfts = 0;
        uint256 currentId = listingId.current();


        for (uint256 i = 0; i < currentId; ++i) {
            uint256 _listingId = i + 1;
            if(idToListing[_listingId].currentlyListed) {
                currentlyListedNfts++;
            }
        }

        Listing[] memory listings = new Listing[](currentlyListedNfts);
        uint256 index = 0;

        for (uint256 i = 0; i < currentId; ++i) {
            uint256 _listingId = i + 1;
            if(idToListing[_listingId].currentlyListed) {
                Listing storage currentItem = idToListing[_listingId];
                listings[index] = currentItem;
                index++;
            }
        }

        return listings;
    }

    function displayUserTokens(address _user) external view returns (Listing[] memory) {
        uint256 currentTokenAmount = mintedTokens.current();
        address[] memory _tokensOwned = getTokensOwned(_user);
        uint256 allTokens = _tokensOwned.length;

        Listing[] memory listings = new Listing[](allTokens);
        uint256 index = 0;

        for (uint256 i = 0; i < allTokens; ++i) {
            for (uint256 j = 0; j < currentTokenAmount; ++j) {
                uint256 _listingId = j + 1;
                if(idToListing[_listingId].minterContract != address(0)) {
                    if(idToListing[_listingId].listingCreator == _user) {
                        if(idToListing[_listingId].currentlyListed) {
                            if(_tokensOwned[i] == idToListing[_listingId].minterContract) {
                                    Listing memory currentItem = idToListing[_listingId];
                                    listings[index] = currentItem;
                                    index++;
                                    break;
                            }
                        }
                    }
                }
                
                if(_listingId == currentTokenAmount && _tokensOwned[i] != idToListing[_listingId].minterContract) {
                    Listing memory currentItem = Listing({
                        listingCreator: address(0),
                        minterContract: _tokensOwned[i],
                        tokenId: 1,
                        listingId: 0,
                        quantity: balanceOf(_tokensOwned[i], msg.sender, 1),
                        pricePerToken: 0,
                        currentlyListed: false
                    });
                    listings[index] = currentItem;
                    index++;
                }
            }
        }

        return listings;
    }


    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return idToListing[_listingId];
    }

    /**
     * @notice Returns the balance of an account for this NFT.
     * 
     * @param account The address of the account
     * @param id The id of the NFT
     */
    function balanceOf(address _minterContract, address account, uint256 id) public view returns (uint256) {
        ERC1155 _erc1155Contract;
        _erc1155Contract = ERC1155(_minterContract);
        return _erc1155Contract.balanceOf(account, id);
    }

    /**
     * @notice Returns the address of the treasury contract.
     */
    function getTreasuryContractAddress() public view returns (address) {
        return treasuryContractAddress;
    }

    function getOwnerAmountListed(address _minterContract, address _owner) public view returns (uint256) {
        return ownerBalancesListed[_minterContract][_owner];
    }

    function getTokensOwned(address _user) public view returns (address[] memory) {
        return tokensOwned[_user];
    }

    function getMintedTokens() public view returns (uint256) {
        return mintedTokens.current();
    }

}