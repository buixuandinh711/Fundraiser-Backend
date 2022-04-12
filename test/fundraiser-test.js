const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("Fundraiser test", function () {

   let fundraiser;
   let owner, funder;

   const fundName = "Wind Generator";
   const fundId = 3;
   const fundSupply = 2;
   const basePrice = ethers.utils.parseUnits("1.0", "ether");
   const baseURI = "ipfs://afdsf32sfaf/";
   const INIT_TOKEN_COUNTER = 0;

   before(async function () {

      const networkName = hre.network.name;
        if (networkName != "hardhat") {
            this.skip();
      }

      [owner, funder] = await ethers.getSigners();
      const Fundraiser = await ethers.getContractFactory("Fundraiser");
      fundraiser = await Fundraiser.connect(owner).deploy();
      const initTx = await fundraiser.initialize(owner.address, fundName, fundId, fundSupply, basePrice, baseURI);
      await initTx.wait();
      await fundraiser.deployed();

   })

   it("Should be return the true initial value", async function () {

      const name = await fundraiser.getFundName();
      expect(name).to.be.equal(fundName);

      const id = await fundraiser.getFundId();
      expect(id).to.be.equal(fundId);

      const supply = await fundraiser.getSupply();
      expect(supply).to.be.equal(fundSupply);

      const price = await fundraiser.getBasePrice();
      expect(price.eq(basePrice)).to.be.true;

      const tokenCounter = await fundraiser.getTokenCounter();
      expect(tokenCounter).to.be.equal(INIT_TOKEN_COUNTER);

   })

   it("Should create a new fund token", async function () {

      const initTokenCounter = await fundraiser.getTokenCounter();


      const sendAmount = basePrice;
      const fundTx = await fundraiser.connect(funder).fund({ value: sendAmount });
      const receipt =  await fundTx.wait();
      const newTokenId = receipt.events[1].args.tokenId;

      expect(newTokenId.gt(initTokenCounter)).to.be.true;

      const tokenOwner = await fundraiser.ownerOf(newTokenId);
      expect(tokenOwner).to.be.equal(funder.address);

      const uri = await fundraiser.tokenURI(newTokenId);
      expect(uri).to.be.equal(baseURI + newTokenId);

   })

   it("Should make Fundraiser to ended state", async function () {
      const sendAmount = basePrice;
      const fundTx = await fundraiser.connect(funder).fund({ value: sendAmount });
      await fundTx.wait();
      const openState = await fundraiser.getFundOpenState();
      expect(openState).to.be.false;
   })

   it("Shouldn't fund anymore after fund closed", async function () {
      const sendAmount = basePrice;
      await expect(fundraiser.connect(funder).fund({ value: sendAmount }))
         .to.be.revertedWith("This fundraiser is ended!");
   })

   it("Should withdraw funded amount", async function () {

      const beforeOwnerBalance = await owner.getBalance();
      const withdrawTx = await fundraiser.withdraw();
      await withdrawTx.wait();
      const afterOwnerBalnce = await owner.getBalance();
      expect(afterOwnerBalnce.gt(beforeOwnerBalance)).to.be.true;

      const fundraiserBalance = await ethers.provider.getBalance(fundraiser.address);
      expect(fundraiserBalance.eq(ethers.BigNumber.from(0))).to.be.true;

   })

})