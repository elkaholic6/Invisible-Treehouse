const { expect } = require("chai");
const hre = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Minter", function () {
  let nftMarketplace;
  let minter;
  async function deployContractAndSetVariables() {
    const [owner, buyer] = await ethers.getSigners();

    const royaltyFee = 500;
    const maxSupply = 10;
    const uri = "ipfs://bafyreidbop6o4o26cziqgtxoobstopfcgh3oga6byuzu4d7vewj22mf3vu/metadata.json";

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    const Minter = await ethers.getContractFactory("Minter");
    minter = await Minter.deploy(uri, nftMarketplace.address, maxSupply, "Invisible Treehouse", "TREE", royaltyFee);
    await minter.deployed();
    
    let id = 0;

    return { owner, buyer, minter, id };
  }

  it('should allow minting of many nfts to a single tokenId', async function() {
    const { minter, id } = await loadFixture(deployContractAndSetVariables);
    const value = ethers.utils.parseEther('5');

    expect(await minter.mint(5, { value: value }));
    expect(await minter.getTotalMinted(1)).to.equal(5);
    expect(await minter.getTotalMinted(2)).to.equal(0);
  });

  it('should allow mint if price == msg.value', async function() {
    const { minter, id } = await loadFixture(deployContractAndSetVariables);
    const value = ethers.utils.parseEther('1');
    expect(await minter.mint(1, { value: value }));
  }) 
  
  it('should revert because it exceeds max supply', async function() {
    const { minter, id } = await loadFixture(deployContractAndSetVariables);
    const value = ethers.utils.parseEther('11');
    await expect(minter.mint(11, { value: value })).to.be.revertedWith("Sorry, that exceeds the max supply");
  })

  it('should allow mint if supply is <= max supply', async function() {
    const { minter, id } = await loadFixture(deployContractAndSetVariables);
    const value = ethers.utils.parseEther('10');
    expect(await minter.mint(10, { value: value }));
  }) 

  it('should emit all the correct parameters of NFTMinterDeployed event', async function() {
    const { minter, owner } = await loadFixture(deployContractAndSetVariables);
    
    await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });

    const [NFTMinterDeployed] = await minter.queryFilter("NFTMinterDeployed");
    expect(NFTMinterDeployed.args.minterContract).to.equal(minter.address);
    expect(NFTMinterDeployed.args.tokenCreator).to.equal(owner.address);
    expect(NFTMinterDeployed.args.maxSupply).to.equal(10);
    expect(NFTMinterDeployed.args.amountMinted).to.equal(1);
    expect(NFTMinterDeployed.args.tokenId).to.equal(1);
  })

  it('should only allow the owner to mint', async function() {
    const { minter, owner, buyer } = await loadFixture(deployContractAndSetVariables);
    
    expect(await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') }));
    await expect(minter.connect(buyer).mint(1, { value: ethers.utils.parseEther('1') })).to.be.revertedWith("Ownable: Not authorized");
  })

  it('Must revert if the mint function has already been called', async function() {
    const { minter, owner } = await loadFixture(deployContractAndSetVariables);
    
    await minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') });
    await expect(minter.connect(owner).mint(1, { value: ethers.utils.parseEther('1') })).to.be.revertedWith("Already minted NFTs. Must deploy new contract to mint more");
  })
});