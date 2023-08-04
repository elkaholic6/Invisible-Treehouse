const { expect } = require("chai");
const hre = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTMarketplace", function () {
    let nftMarketplace;
    let minter;

    async function deployContractsAndSetVariables() {
        const [owner, buyer, buyer2, buyer3, buyer4 ] = await ethers.getSigners();

        const royaltyFee = 500;
        const maxSupply = 10;
        const uri = "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json";

        const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
        nftMarketplace = await NFTMarketplace.deploy();
        await nftMarketplace.deployed();

        const Minter = await ethers.getContractFactory("Minter");
        minter = await Minter.deploy(uri, nftMarketplace.address, maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
        await minter.deployed();

        return { owner, buyer, buyer2, buyer3, buyer4, nftMarketplace, minter, royaltyFee };
    }

    it("should list a token", async function () {
        const { owner, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);
        await nftMarketplace.setERC1155Contract(minter.address);

        const listingParams = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams);

        const [listingEvent] = await nftMarketplace.queryFilter("NewListing");
        expect(listingEvent.args.minterContract).to.equal(minter.address);
        expect(listingEvent.args.listingCreator).to.equal(owner.address);
        
    })

    it("should display all listed different ERC1155 NFTs", async function () {
        const { owner, buyer, buyer2, nftMarketplace, royaltyFee } = await loadFixture(deployContractsAndSetVariables);
    
        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        const numMinters = 3; // Number of Minter contracts to deploy and list
        const minterContracts = []; // Array to store deployed Minter contracts
        const _uri = ["https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreiby44dfycnyswxummpzrftze6oba6lnzxnohkuz673fc7viqc5nqy/metadata.json"];
        const _minterAddress = [owner, buyer, buyer2];
        const _price = ethers.utils.parseEther('1');
        const _maxSupply = 10;

        for (let i = 0; i < numMinters; i++) {
            const Minter = await ethers.getContractFactory("Minter");
            const minter = await Minter.connect(_minterAddress[i]).deploy(_uri[i], nftMarketplace.address, _maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
            await minter.deployed();
            minterContracts.push(minter);
            await minter.connect(_minterAddress[i]).addAllowedOperator(nftMarketplace.address);

            await minter.connect(_minterAddress[i]).mint(1, { value: ethers.utils.parseEther('1') });
            await minter.connect(_minterAddress[i]).setApprovalForAll(nftMarketplace.address, true);
            await minter.connect(_minterAddress[i]).setApproval(nftMarketplace.address, true);
            await nftMarketplace.setERC1155Contract(minter.address);

            const listingParams = {
                minterContract: minter.address,
                tokenId: 1,
                // listingId: [i + 1],
                quantity: 1,
                pricePerToken: ethers.utils.parseEther('1'),
                currentlyListed: true
            };
    
            await nftMarketplace.connect(_minterAddress[i]).listToken(listingParams);
        }
    
        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTs.length).to.equal(numMinters);
        expect(listedNFTs.length).to.not.equal(4);

        for (let i = 0; i < numMinters; i++) {
            const listing = listedNFTs[i];
    
            expect(listing.minterContract).to.equal(minterContracts[i].address);
            expect(listing.listingCreator).to.equal(_minterAddress[i].address);
            expect(listing.tokenId).to.equal(listedNFTs[i].tokenId);
        }
    });

    it("should buy a listed NFT", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);
        await nftMarketplace.setERC1155Contract(minter.address);

        const listingParams = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams);
        

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);
        console.log('Expected total price: ', expectedTotalPrice);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });

        const [saleEvent] = await nftMarketplace.queryFilter("NewSale");
        expect(saleEvent.args.listingCreator).to.equal(listing.listingCreator);
        expect(saleEvent.args.minterContract).to.equal(listing.minterContract);
        expect(saleEvent.args.tokenId).to.equal(listing.tokenId);
        expect(saleEvent.args.quantity).to.equal(listing.quantity);
        expect(saleEvent.args.pricePerToken).to.equal(listing.pricePerToken);
    });

    it("Should decrease the buyer's ether balance and increase the seller's ether balance", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);
        await nftMarketplace.setERC1155Contract(minter.address);

        const listingParams = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams);
        

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        const platformFeeCut = (expectedTotalPrice.mul(250)).div(10000);

        const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

        const royaltyRecipientBalanceBefore = await ethers.provider.getBalance(owner.address);
        const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

        const gasEstimate = await nftMarketplace.connect(buyer).estimateGas.buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });
        const gasPrice = await ethers.provider.getGasPrice();
        const txnCost = gasEstimate.mul(gasPrice);
        const expectedTotalPriceWithGas = expectedTotalPrice.add(txnCost);
        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });

        const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

        const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

        expect((ownerBalanceAfter.sub(ownerBalanceBefore)).add(platformFeeCut)).to.equal(expectedTotalPrice);
        expect(buyerBalanceBefore.sub(buyerBalanceAfter)).to.be.closeTo(expectedTotalPriceWithGas, 1000000000000000);
    });

    it("Should allow listing multiple NFTs", async function () {
        const { owner, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(5, { value: ethers.utils.parseEther('5') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        expect(await nftMarketplace.listToken(listingParams1)).to.not.be.reverted;
        
        const listingParams2 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 2,
            quantity: 4,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        expect(await nftMarketplace.listToken(listingParams2)).to.not.be.reverted;

        const listingParams3 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 3,
            quantity: 1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await expect(nftMarketplace.listToken(listingParams3)).to.be.revertedWith("Cannot list more than owned");
    });

    it("Should always increase the royaltyRecipient's balance on subsequent sales", async function () {
        const { owner, buyer, buyer2, nftMarketplace, minter, royaltyFee } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(buyer).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(buyer2).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);
        await nftMarketplace.setERC1155Contract(minter.address);

        const listingParams = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams);
        

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        const platformFeeCut = (expectedTotalPrice.mul(250)).div(10000);

        const royaltyRecipientBalanceBefore = await ethers.provider.getBalance(owner.address);
        const marketplaceBalance = await ethers.provider.getBalance(nftMarketplace.address);
        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });
        const marketplaceBalance2 = await ethers.provider.getBalance(nftMarketplace.address);
        const royaltyRecipientBalanceAfter = await ethers.provider.getBalance(owner.address);

        expect((royaltyRecipientBalanceAfter.sub(royaltyRecipientBalanceBefore)).add(platformFeeCut)).to.equal(expectedTotalPrice);

        await nftMarketplace.connect(buyer).listToken(listingParams);

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];

        const expectedTotalPrice2 = listing2.pricePerToken.mul(listing2.quantity);

        await nftMarketplace.connect(buyer2).buyListedToken(listing2.listingId, buyer2.address, listing2.quantity, { value: expectedTotalPrice2 });
        const marketplaceBalance3 = await ethers.provider.getBalance(nftMarketplace.address);

        const royaltyRecipientBalanceAfter2 = await ethers.provider.getBalance(owner.address);
        const _royaltyFee = (listing2.pricePerToken.mul(royaltyFee) / 10000).toString();
        const royaltyFeeAfter = (royaltyRecipientBalanceAfter2.sub(royaltyRecipientBalanceAfter)).toString();

        expect(royaltyFeeAfter).to.equal(_royaltyFee);
    });

    it("Should expect the seller's balance to decrease by 1 and the buyers balance to increase by 1", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        expect(await nftMarketplace.listToken(listingParams1)).to.not.be.reverted;

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        expect(await nftMarketplace.balanceOf(listing.minterContract, owner.address, listing.tokenId)).to.equal(1);
        expect(await nftMarketplace.balanceOf(listing.minterContract, buyer.address, listing.tokenId)).to.equal(0);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });

        expect(await nftMarketplace.balanceOf(listing.minterContract, owner.address, listing.tokenId)).to.equal(0);
        expect(await nftMarketplace.balanceOf(listing.minterContract, buyer.address, listing.tokenId)).to.equal(1);
    })

    it("Should only allow the owner of the NFT to list", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams1);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        await nftMarketplace.setERC1155Contract(listing.minterContract);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });

        expect(await nftMarketplace.connect(buyer).listToken(listingParams1)).not.to.be.reverted;
        await expect(nftMarketplace.connect(owner).listToken(listingParams1)).to.be.revertedWith("Cannot list more than owned");
    })

    it("should allow the NFT to transfer even if marketplace is not approved to transfer ownership of Ownable contract", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        // await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams1);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        await nftMarketplace.setERC1155Contract(listing.minterContract);

        const minterOwner = await minter.owner();
        expect(minterOwner).to.equal(owner.address);
        await expect(nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice })).to.not.be.reverted;
        const minterOwner2 = await minter.getOwner();
        expect(minterOwner2).to.equal(owner.address);
    })

    it("Should only list all NFTs if bool currentlyListed is true", async function () {
        const { owner, buyer, buyer2, nftMarketplace, minter, royaltyFee } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        const numMinters = 3; // Number of Minter contracts to deploy and list
        const minterContracts = []; // Array to store deployed Minter contracts
        const _uri = ["https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreiby44dfycnyswxummpzrftze6oba6lnzxnohkuz673fc7viqc5nqy/metadata.json"];
        const _minterAddress = [owner, buyer, buyer2];
        const _price = ethers.utils.parseEther('1');
        const _maxSupply = 10;

        for (let i = 0; i < numMinters; i++) {
            const Minter = await ethers.getContractFactory("Minter");
            // const royaltyFee = ethers.utils.parseEther('0.1');
            const minter = await Minter.connect(_minterAddress[i]).deploy(_uri[i], nftMarketplace.address, _maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
            await minter.deployed();
            minterContracts.push(minter);
            await minter.connect(_minterAddress[i]).addAllowedOperator(nftMarketplace.address);


            await minter.connect(_minterAddress[i]).mint(1, { value: ethers.utils.parseEther('1') });
            await minter.connect(_minterAddress[i]).setApprovalForAll(nftMarketplace.address, true);
            await minter.connect(_minterAddress[i]).setApproval(nftMarketplace.address, true);
            await nftMarketplace.setERC1155Contract(minter.address);

            const listingParams = {
                minterContract: minter.address,
                tokenId: 1,
                listingId: [i + 1],
                quantity: 1,
                pricePerToken: ethers.utils.parseEther('1'),
                currentlyListed: true
            };
    
            await nftMarketplace.connect(_minterAddress[i]).listToken(listingParams);
        }
    
        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        expect(listedNFTs.length).to.equal(3);

        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });
        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];
        expect(listedNFTs2.length).to.equal(2);

        await nftMarketplace.connect(owner).buyListedToken(listing2.listingId, owner.address, listing2.quantity, { value: expectedTotalPrice });
        const listedNFTs3 = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTs3.length).to.equal(1);

        const listingParams1 = {
            minterContract: listing2.minterContract,
            tokenId: 1,
            // listingId: 4,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams1);
        const listedNFTs4 = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTs4.length).to.equal(2);
    });

    it("Should effectively cancel listings", async function () {
        const { owner, buyer, buyer2, nftMarketplace, minter, royaltyFee } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        const numMinters = 3; // Number of Minter contracts to deploy and list
        const minterContracts = []; // Array to store deployed Minter contracts
        const _uri = ["https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreiby44dfycnyswxummpzrftze6oba6lnzxnohkuz673fc7viqc5nqy/metadata.json"];
        const _minterAddress = [owner, buyer, buyer2];
        const _price = ethers.utils.parseEther('1');
        const _maxSupply = 10;

        for (let i = 0; i < numMinters; i++) {
            const Minter = await ethers.getContractFactory("Minter");
            // const royaltyFee = ethers.utils.parseEther('0.1');
            const minter = await Minter.connect(_minterAddress[i]).deploy(_uri[i], nftMarketplace.address, _maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
            await minter.deployed();
            minterContracts.push(minter);
            await minter.connect(_minterAddress[i]).addAllowedOperator(nftMarketplace.address);


            await minter.connect(_minterAddress[i]).mint(1, { value: ethers.utils.parseEther('1') });
            await minter.connect(_minterAddress[i]).setApprovalForAll(nftMarketplace.address, true);
            await minter.connect(_minterAddress[i]).setApproval(nftMarketplace.address, true);
            await nftMarketplace.setERC1155Contract(minter.address);

            const listingParams = {
                minterContract: minter.address,
                tokenId: 1,
                // listingId: [i + 1],
                quantity: 1,
                pricePerToken: ethers.utils.parseEther('1'),
                currentlyListed: true
            };
    
            await nftMarketplace.connect(_minterAddress[i]).listToken(listingParams);
        }
    
        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        expect(listedNFTs.length).to.equal(3);

        await nftMarketplace.connect(owner).cancelListing(listing.minterContract, listing.listingId, 1);

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTs2.length).to.equal(2);

        await expect(nftMarketplace.connect(owner).cancelListing(listing.minterContract, listing.listingId, 1)).to.be.revertedWith("Listing is not currently listed");
    });

    it("Should update listings, only allow the token owner to update, and only listed tokens can be updated", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await expect(nftMarketplace.connect(owner).updateListing(listingParams1, 1)).to.be.revertedWith("Listing is not currently listed");
        await nftMarketplace.connect(owner).listToken(listingParams1);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        const oldPricePerToken = ethers.utils.parseEther('1');

        expect(listing.pricePerToken).to.equal(oldPricePerToken);

        await nftMarketplace.setERC1155Contract(listing.minterContract);

        const listingParams2 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('2'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).updateListing(listingParams2, 1);
        await expect(nftMarketplace.connect(buyer).updateListing(listingParams2, 1)).to.be.revertedWith("Only listing creator can update listing");

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];

        const updatedPricePerToken = ethers.utils.parseEther('2');
        const [updateEvent] = await nftMarketplace.queryFilter("UpdatedListing");
        expect(updateEvent.args.listingCreator).to.equal(listing2.listingCreator);
        expect(updateEvent.args.minterContract).to.equal(listing2.minterContract);
        expect(updateEvent.args.tokenId).to.equal(listing2.tokenId);
        expect(updateEvent.args.quantity).to.equal(listing2.quantity);
        expect(updateEvent.args.pricePerToken).to.equal(listingParams2.pricePerToken);
        expect(listing2.pricePerToken).to.equal(updatedPricePerToken);
        expect(listing2.pricePerToken).to.not.equal(oldPricePerToken);
    });

    it("should create a new listing if the quantity being updated doesn't equal the amount currently listed", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(10, { value: ethers.utils.parseEther('10') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  10,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await expect(nftMarketplace.connect(owner).updateListing(listingParams1, 1)).to.be.revertedWith("Listing is not currently listed");

        await nftMarketplace.connect(owner).listToken(listingParams1);

        const listedNFTsOg = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTsOg.length).to.equal(1);

        const listingParams2 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 2,
            quantity:  4,
            pricePerToken: ethers.utils.parseEther('2'),
            currentlyListed: true
        }

        await(nftMarketplace.connect(owner).updateListing(listingParams2, 1));

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(10);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTs.length).to.equal(2);
        
        const listing = listedNFTs[0];
        const listing2 = listedNFTs[1];

        expect(listing.quantity).to.equal(6);
        expect(listing.pricePerToken).to.equal(listingParams1.pricePerToken);
        expect(listing2.quantity).to.equal(4);
        expect(listing2.pricePerToken).to.equal(listingParams2.pricePerToken);

        await(nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, 6, { value: ethers.utils.parseEther('6') }));
        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        expect(listedNFTs2.length).to.equal(1);

        await(nftMarketplace.connect(buyer).buyListedToken(listedNFTs2[0].listingId, buyer.address, 2, { value: ethers.utils.parseEther('4') }));
        const listedNFTs3 = await nftMarketplace.displayAllListedNfts();

        expect(listedNFTs3.length).to.equal(1);
        expect(listedNFTs3[0].quantity).to.equal(2);

        await(nftMarketplace.connect(buyer).buyListedToken(listedNFTs3[0].listingId, buyer.address, 2, { value: ethers.utils.parseEther('4') }));
        const listedNFTs4 = await nftMarketplace.displayAllListedNfts();

        expect(listedNFTs4.length).to.equal(0);
    });

    it("Should send platform fee cut to the Treasury contract", async function () {
        const { owner, buyer, buyer2, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        const treasuryContractAddress = await nftMarketplace.getTreasuryContractAddress();
        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }
        await nftMarketplace.connect(owner).listToken(listingParams1);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);


        const treasuryContractBalance = await ethers.provider.getBalance(treasuryContractAddress);
        expect(treasuryContractBalance).to.equal(0);
        const marketplaceBalance = await ethers.provider.getBalance(nftMarketplace.address);
        expect(marketplaceBalance).to.equal(0);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });
        const treasuryContractBalance2 = await ethers.provider.getBalance(treasuryContractAddress);

        const marketplaceBalance1 = await ethers.provider.getBalance(nftMarketplace.address);
        expect(marketplaceBalance1).to.equal(0);

        expect(treasuryContractBalance2).to.equal(25000000000000000n);

        const listingParams2 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }
        await minter.connect(buyer).setApprovalForAll(nftMarketplace.address, true);

        await nftMarketplace.connect(buyer).listToken(listingParams2);

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];
        
        await nftMarketplace.connect(buyer2).buyListedToken(listing2.listingId, buyer2.address, listing2.quantity, { value: expectedTotalPrice });
        const treasuryContractBalance3 = await ethers.provider.getBalance(treasuryContractAddress);
        expect(treasuryContractBalance3).to.equal(50000000000000000n);
    });

    it("should accurately update the owners listed tokens balance", async function () {
        const { owner, nftMarketplace, minter, buyer } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(0);

        await minter.connect(owner).mint(10, { value: ethers.utils.parseEther('10') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(0);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams1);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(1);
        
        const listingParams2 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 2,
            quantity: 9,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams2);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(10);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        
        const listing2 = listedNFTs[1];
        expect(listedNFTs.length).to.equal(2);

        await nftMarketplace.connect(owner).cancelListing(listing2.minterContract, listing2.listingId, 1);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(9);

        await nftMarketplace.connect(owner).cancelListing(listing2.minterContract, listing2.listingId, 2);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(7);

        await expect(nftMarketplace.connect(owner).cancelListing(listing2.minterContract, listing2.listingId, 8)).to.be.revertedWith("Insufficient balance, cannot cancel that amount");

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(7);

        const expectedTotalPrice = listing2.pricePerToken;
        await nftMarketplace.connect(buyer).buyListedToken(listing2.listingId, buyer.address, 1, { value: expectedTotalPrice });

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(6);

        //this is to test if previous listings still update getOwnerAmountListed
        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, 1, { value: listing.pricePerToken });
        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(5);

        const expectedTotalPrice2 = ethers.utils.parseEther('3');
        await nftMarketplace.connect(buyer).buyListedToken(listing2.listingId, buyer.address, 3, { value: expectedTotalPrice2 });

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(2);

        const expectedTotalPrice3 = ethers.utils.parseEther('4');
        await expect(nftMarketplace.connect(buyer).buyListedToken(listing2.listingId, buyer.address, 4, { value: expectedTotalPrice3 })).to.be.revertedWith("Cannot buy more than listing quantity");
        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(2);
    });

    it("should update the tokensOwned on the Marketplace contract when a new contract is minted, and when tokens are transferred", async function () {
        const { owner, buyer, buyer2, buyer3, buyer4, nftMarketplace, minter, royaltyFee } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        const tokensOwned = await nftMarketplace.getTokensOwned(owner.address);
        // expect(tokensOwned[0]).to.equal('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

        expect(await tokensOwned.length).to.equal(1);

        const numMinters = 3; // Number of Minter contracts to deploy and list
        const minterContracts = []; // Array to store deployed Minter contracts
        const _uri = ["https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreiby44dfycnyswxummpzrftze6oba6lnzxnohkuz673fc7viqc5nqy/metadata.json"];
        const _minterAddress = [buyer, buyer2, buyer3];
        const _maxSupply = 10;

        for (let i = 0; i < numMinters; i++) {
            const Minter = await ethers.getContractFactory("Minter");
            // const royaltyFee = ethers.utils.parseEther('0.1');
            const minter = await Minter.connect(_minterAddress[i]).deploy(_uri[i], nftMarketplace.address, _maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
            await minter.deployed();
            minterContracts.push(minter);
            await minter.connect(_minterAddress[i]).addAllowedOperator(nftMarketplace.address);

            await minter.connect(_minterAddress[i]).mint(1, { value: ethers.utils.parseEther('1') });
            await minter.connect(_minterAddress[i]).setApprovalForAll(nftMarketplace.address, true);
            await minter.connect(_minterAddress[i]).setApproval(nftMarketplace.address, true);
            await nftMarketplace.setERC1155Contract(minter.address);
        }

        expect((await nftMarketplace.getTokensOwned(buyer.address)).length).to.equal(1);
        expect((await nftMarketplace.getTokensOwned(buyer2.address)).length).to.equal(1);
        expect((await nftMarketplace.getTokensOwned(buyer3.address)).length).to.equal(1);
        expect((await nftMarketplace.getTokensOwned(buyer4.address)).length).to.equal(0);

        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams1);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });
        expect((await nftMarketplace.getTokensOwned(buyer.address)).length).to.equal(2);
        expect((await nftMarketplace.getTokensOwned(owner.address)).length).to.equal(0);

        const listingParams2 = {
            minterContract: minterContracts[1].address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }
        const buyer2Tokens = await nftMarketplace.getTokensOwned(buyer2.address);
        await nftMarketplace.connect(buyer2).listToken(listingParams2);

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];
        const expectedTotalPrice2 = listing2.pricePerToken.mul(listing2.quantity);

        await nftMarketplace.connect(buyer).buyListedToken(listing2.listingId, buyer.address, listing2.quantity, { value: expectedTotalPrice2 });

        expect((await nftMarketplace.getTokensOwned(buyer.address)).length).to.equal(3);
        expect((await nftMarketplace.getTokensOwned(buyer2.address)).length).to.equal(0);

        const buyerTokens = await nftMarketplace.getTokensOwned(buyer.address);

        const listingParams3 = {
            minterContract: buyerTokens[0],
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await minterContracts[0].connect(buyer).setApprovalForAll(nftMarketplace.address, true);
        await minterContracts[0].connect(buyer).setApproval(nftMarketplace.address, true);
        await nftMarketplace.connect(buyer).listToken(listingParams3);

        const listedNFTs3 = await nftMarketplace.displayAllListedNfts();
        const listing3 = listedNFTs3[0];
        const expectedTotalPrice3 = listing3.pricePerToken.mul(listing3.quantity);

        await nftMarketplace.connect(owner).buyListedToken(listing3.listingId, owner.address, listing3.quantity, { value: expectedTotalPrice3 });

        expect((await nftMarketplace.getTokensOwned(buyer.address)).length).to.equal(2);
        expect((await nftMarketplace.getTokensOwned(owner.address)).length).to.equal(1);

        const buyerToken2 = await nftMarketplace.getTokensOwned(buyer.address);
        // expect(buyerToken2[1]).to.equal('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
        // expect(buyerToken2[0]).to.equal('0x663F3ad617193148711d28f5334eE4Ed07016602');

        const ownerTokens = await nftMarketplace.getTokensOwned(owner.address);
        // expect(ownerTokens[0]).to.equal('0x8464135c8F25Da09e49BC8782676a84730C318bC');
    });

    it("Should only update the tokensOwned on secondary transactions if the ownerBalance - quanty == 0", async function () {
        const { owner, buyer, nftMarketplace, minter } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(10, { value: ethers.utils.parseEther('10') });
        const tokensOwned = await nftMarketplace.getTokensOwned(owner.address);
        // expect(tokensOwned[0]).to.equal('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

        expect(await tokensOwned.length).to.equal(1);

        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  4,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams1);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(4);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });
        expect((await nftMarketplace.getTokensOwned(buyer.address)).length).to.equal(1);
        expect((await nftMarketplace.getTokensOwned(owner.address)).length).to.equal(1);

        const buyerTokens = await nftMarketplace.getTokensOwned(buyer.address);
        // expect(buyerTokens[0]).to.equal('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
        const ownerTokens = await nftMarketplace.getTokensOwned(owner.address);
        // expect(ownerTokens[0]).to.equal('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

        const listingParams2 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  6,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams2);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(6);

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];
        const expectedTotalPrice2 = listing2.pricePerToken.mul(listing2.quantity);

        await nftMarketplace.connect(buyer).buyListedToken(listing2.listingId, buyer.address, listing2.quantity, { value: expectedTotalPrice2 });

        expect((await nftMarketplace.getTokensOwned(buyer.address)).length).to.equal(1);
        expect((await nftMarketplace.getTokensOwned(owner.address)).length).to.equal(0);

        const buyerTokens2 = await nftMarketplace.getTokensOwned(buyer.address);
        // expect(buyerTokens2[0]).to.equal('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
    });

    it("Should only allow the minterContract to call the addTokens function on the marketplace contract", async function () {
        const { owner, nftMarketplace } = await loadFixture(deployContractsAndSetVariables);

        await expect(nftMarketplace.connect(owner).addTokensFromMinter(owner.address, '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')).to.be.revertedWith('Only minter contract can add tokens');
    });

    it("Should show both listed and unlisted tokens when calling displayUserTokens(address _user)", async function () {
        const { owner, buyer, buyer2, buyer3, buyer4, nftMarketplace, minter, royaltyFee } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const numMinters = 3; // Number of Minter contracts to deploy and list
        const minterContracts = []; // Array to store deployed Minter contracts
        const _uri = ["https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreiby44dfycnyswxummpzrftze6oba6lnzxnohkuz673fc7viqc5nqy/metadata.json"];
        // const _minterAddress = [buyer, buyer2, buyer3];
        const _maxSupply = 10;

        for (let i = 0; i < numMinters; i++) {
            const Minter = await ethers.getContractFactory("Minter");
            // const royaltyFee = ethers.utils.parseEther('0.1');
            const minter = await Minter.connect(owner).deploy(_uri[i], nftMarketplace.address, _maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
            await minter.deployed();
            minterContracts.push(minter);
            await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

            await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
            await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
            await minter.connect(owner).setApproval(nftMarketplace.address, true);
            await nftMarketplace.setERC1155Contract(minter.address);
        }

        const tokensOwned = await nftMarketplace.getTokensOwned(owner.address);
        expect(await tokensOwned.length).to.equal(4);

        const allTokens = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens.length).to.equal(4);

        expect(allTokens[0].currentlyListed).to.equal(false);
        expect(allTokens[1].currentlyListed).to.equal(false);
        expect(allTokens[2].currentlyListed).to.equal(false);
        expect(allTokens[3].currentlyListed).to.equal(false);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams1);
        const allTokens1 = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens1.length).to.equal(4);

        expect(allTokens1[0].currentlyListed).to.equal(true);
        expect(allTokens1[1].currentlyListed).to.equal(false);
        expect(allTokens1[2].currentlyListed).to.equal(false);
        expect(allTokens1[3].currentlyListed).to.equal(false);

        expect(await nftMarketplace.getOwnerAmountListed(minter.address, owner.address)).to.equal(1);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];
        const expectedTotalPrice = listing.pricePerToken.mul(listing.quantity);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, listing.quantity, { value: expectedTotalPrice });

        const allTokens2owner = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens2owner.length).to.equal(3);

        expect(allTokens2owner[0].currentlyListed).to.equal(false);
        expect(allTokens2owner[1].currentlyListed).to.equal(false);
        expect(allTokens2owner[2].currentlyListed).to.equal(false);

        const allTokens2buyer = await nftMarketplace.displayUserTokens(buyer.address);
        expect(allTokens2buyer.length).to.equal(1);
        expect(allTokens2buyer[0].currentlyListed).to.equal(false);

        const listingParams2 = {
            minterContract: minterContracts[0].address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams2);
        const allTokens2ndListing = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens2ndListing.length).to.equal(3);

        expect(allTokens2ndListing[0].currentlyListed).to.equal(false);
        expect(allTokens2ndListing[1].currentlyListed).to.equal(true);
        expect(allTokens2ndListing[2].currentlyListed).to.equal(false);

        expect(await nftMarketplace.getOwnerAmountListed(minterContracts[0].address, owner.address)).to.equal(1);

        const listingParams3 = {
            minterContract: minterContracts[1].address,
            tokenId: 1,
            // listingId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        await nftMarketplace.listToken(listingParams3);
        const allTokens3rdListing = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens3rdListing.length).to.equal(3);

        expect(allTokens3rdListing[0].currentlyListed).to.equal(false);
        expect(allTokens3rdListing[1].currentlyListed).to.equal(true);
        expect(allTokens3rdListing[2].currentlyListed).to.equal(true);

        const listedNFTs2 = await nftMarketplace.displayAllListedNfts();
        const listing2 = listedNFTs2[0];
        expect(listedNFTs2.length).to.equal(2);

        await nftMarketplace.connect(owner).cancelListing(listing2.minterContract, listing2.listingId, 1);

        const allTokensAfterCancel = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokensAfterCancel.length).to.equal(3);

        expect(allTokensAfterCancel[0].currentlyListed).to.equal(false);
        expect(allTokensAfterCancel[1].currentlyListed).to.equal(false);
        expect(allTokensAfterCancel[2].currentlyListed).to.equal(true);
    });

    it('should display the correct user tokens listed', async function () {
        const { owner, buyer, buyer2, buyer3, buyer4, nftMarketplace, minter, royaltyFee } = await loadFixture(deployContractsAndSetVariables);

        await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

        await minter.connect(owner).mint(10, { value: ethers.utils.parseEther('1') });
        await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
        await minter.connect(owner).setApproval(nftMarketplace.address, true);

        const numMinters = 3; // Number of Minter contracts to deploy and list
        const minterContracts = []; // Array to store deployed Minter contracts
        const _uri = ["https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreibzbkuqjh52yvjovmvs232sxwmczbll66xb5hq4trvramo26bfkau/metadata.json", "https://ipfs.io/ipfs/bafyreiby44dfycnyswxummpzrftze6oba6lnzxnohkuz673fc7viqc5nqy/metadata.json"];
        // const _minterAddress = [buyer, buyer2, buyer3];
        const _maxSupply = 10;

        for (let i = 0; i < numMinters; i++) {
            const Minter = await ethers.getContractFactory("Minter");
            // const royaltyFee = ethers.utils.parseEther('0.1');
            const minter = await Minter.connect(owner).deploy(_uri[i], nftMarketplace.address, _maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
            await minter.deployed();
            minterContracts.push(minter);
            await minter.connect(owner).addAllowedOperator(nftMarketplace.address);

            await minter.connect(owner).mint(10, { value: ethers.utils.parseEther('1') });
            await minter.connect(owner).setApprovalForAll(nftMarketplace.address, true);
            await minter.connect(owner).setApproval(nftMarketplace.address, true);
            await nftMarketplace.setERC1155Contract(minter.address);
        }

        const tokensOwned = await nftMarketplace.getTokensOwned(owner.address);
        expect(await tokensOwned.length).to.equal(4);

        const listingParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            quantity:  6,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        const listingParams2 = {
            minterContract: minterContracts[1].address,
            tokenId: 1,
            quantity:  5,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        const listingParams3 = {
            minterContract: minterContracts[2].address,
            tokenId: 1,
            quantity:  5,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        const listingParams4 = {
            minterContract: minterContracts[0].address,
            tokenId: 1,
            quantity:  5,
            pricePerToken: ethers.utils.parseEther('1'),
            currentlyListed: true
        }

        const updateParams1 = {
            minterContract: minter.address,
            tokenId: 1,
            quantity:  2,
            pricePerToken: ethers.utils.parseEther('2'),
            currentlyListed: true
        }

        const buyerListParams = {
            minterContract: minter.address,
            tokenId: 1,
            quantity:  1,
            pricePerToken: ethers.utils.parseEther('2'),
            currentlyListed: true
        }

        await nftMarketplace.connect(owner).listToken(listingParams1);
        const allTokens1 = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens1.length).to.equal(4);

        expect(allTokens1[0].currentlyListed).to.equal(true);
        expect(allTokens1[1].currentlyListed).to.equal(false);
        expect(allTokens1[2].currentlyListed).to.equal(false);
        expect(allTokens1[3].currentlyListed).to.equal(false);

        await nftMarketplace.listToken(listingParams2);
        const allTokens2 = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens2.length).to.equal(4);

        expect(allTokens2[0].currentlyListed).to.equal(true);
        expect(allTokens2[1].currentlyListed).to.equal(false);
        expect(allTokens2[2].currentlyListed).to.equal(true);
        expect(allTokens2[3].currentlyListed).to.equal(false);

        await nftMarketplace.listToken(listingParams3);
        const allTokens3 = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens3.length).to.equal(4);

        expect(allTokens3[0].currentlyListed).to.equal(true);
        expect(allTokens3[1].currentlyListed).to.equal(false);
        expect(allTokens3[2].currentlyListed).to.equal(true);
        expect(allTokens3[3].currentlyListed).to.equal(true);

        await nftMarketplace.connect(owner).updateListing(updateParams1, 1);


        await nftMarketplace.listToken(listingParams4);
        const allTokens4 = await nftMarketplace.displayUserTokens(owner.address);
        expect(allTokens4.length).to.equal(4);


        expect(allTokens4[0].currentlyListed).to.equal(true);
        expect(allTokens4[1].currentlyListed).to.equal(true);
        expect(allTokens4[2].currentlyListed).to.equal(true);
        expect(allTokens4[3].currentlyListed).to.equal(true);

        const listedNFTs = await nftMarketplace.displayAllListedNfts();
        const listing = listedNFTs[0];

        const expectedTotalPrice = listing.pricePerToken.mul(1);

        await nftMarketplace.connect(buyer).buyListedToken(listing.listingId, buyer.address, 1, { value: expectedTotalPrice });

        const allTokens5 = await nftMarketplace.displayUserTokens(buyer.address);
        expect(allTokens5.length).to.equal(1);

        expect(allTokens5[0].currentlyListed).to.equal(false);
        expect(allTokens5[0].listingCreator).to.equal(ethers.constants.AddressZero);

        await nftMarketplace.connect(buyer).listToken(buyerListParams);

        const allTokens6 = await nftMarketplace.displayUserTokens(buyer.address);
        console.log('allTokens6', allTokens6);
        expect(allTokens6[0].currentlyListed).to.equal(true);
    });
})