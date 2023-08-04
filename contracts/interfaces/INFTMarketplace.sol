// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface INFTMarketplace {

    /**
     * @notice The type of token (as of now is only ERC-1155)
     */
    enum TokenType {
        ERC1155
    }

    
    /**
     *  @notice The parameters a seller sets when creating or updating a listing.
     *
     *  @param minterContract The address of the smart contract of the NFTs being listed.
     *  @param tokenId The tokenId of the NFTs being listed.
     *  @param quantity The quantity of NFTs being listed. This must be non-zero, and is expected to
     *                  be `1` for ERC-721 NFTs.
     *  @param pricePerToken The price to pay per unit of NFTs listed.
     */
    struct ListingParameters {
        address minterContract;
        uint256 tokenId;
        uint256 quantity;
        uint256 pricePerToken;
        bool currentlyListed;
    }

    /**
     *  @notice The information stored for a listing.
     *
     *  @param listingCreator The creator of the listing.
     *  @param minterContract The address of the smart contract of the NFTs being listed.
     *  @param tokenId The tokenId of the NFTs being listed.
     *  @param listingId The listingId of the listing.
     *  @param quantity The quantity of NFTs being listed. This must be non-zero, and is expected to
     *                  be `1` for ERC-721 NFTs.
     *  @param pricePerToken The price to pay per unit of NFTs listed.
     */
    struct Listing {
        address listingCreator;
        address minterContract;
        uint256 tokenId;
        uint256 listingId;
        uint256 quantity;
        uint256 pricePerToken;
        bool currentlyListed;
    }

    /**
     * @notice An event that emits the information of a listing.
     * 
     *  @param listingCreator The creator of the listing.
     *  @param minterContract The address of the smart contract of the NFTs being listed.
     *  @param tokenId The tokenId of the NFTs being listed.
     *  @param quantity The quantity of NFTs being listed. This must be non-zero
     *  @param pricePerToken The price to pay per unit of NFTs listed.
     *  @param currentlyListed Whether or not the listing is currently listed
     */
    event NewListing(
        address indexed listingCreator,
        address indexed minterContract,
        uint256 tokenId,
        uint256 listingId,
        uint256 quantity,
        uint256 pricePerToken,
        bool currentlyListed
    );

/**
 *  @notice An event that emits the information of a sale.
 * 
 *  @param listingCreator The creator of the listing.
 *  @param minterContract The address of the smart contract of the NFTs being sold.
 *  @param tokenId The tokenId of the NFT(s) sold.
 *  @param quantity The quantity of NFTs sold.
 *  @param pricePerToken The price paid per unit of NFTs sold.
 */
    event NewSale(
        address indexed listingCreator,
        address indexed minterContract,
        address buyer,
        uint256 tokenId,
        uint256 quantity,
        uint256 pricePerToken
    );

    /**
     *  @notice An event that emits the information of updating a listing.
     * 
     *  @param listingCreator The creator of the listing.
     *  @param minterContract The address of the smart contract of the NFTs updated.
     *  @param tokenId The tokenId of the NFTs updated.
     *  @param listingId The listingId of the listing.
     *  @param quantity The quantity of NFTs updated.
     *  @param pricePerToken The price paid per unit of NFTs updated.
     *  @param currentlyListed Whether or not the listing is currently listed
     */
    event UpdatedListing(
        address indexed listingCreator, 
        address indexed minterContract, 
        uint256 tokenId, 
        uint256 listingId, 
        uint256 quantity, 
        uint256 pricePerToken,
        bool currentlyListed
    );

    /**
     *  @notice An event that emits the information of cancelling a listing.
     * 
     *  @param listingCreator The creator of the listing.
     *  @param minterContract The address of the smart contract of the NFTs cancelled.
     *  @param tokenId The tokenId of the NFTs cancelled.
     *  @param listingId The listingId of the listing.
     */
    event CancelledListing(
        address indexed listingCreator,
        address indexed minterContract,
        uint256 tokenId,
        uint256 indexed listingId,
        uint256 quantity
    );
}