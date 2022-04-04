const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("FundManager test", function () {
    let fundManager;
    let fundCreator;

    const fundName = "New Bphone";
    const fundSupply = 10;
    const fundBasePrice = ethers.utils.parseUnits("1.0", "ether");
    const fundBaseUri = "ipfs://abcxyz123";

    before(async function () {
        [, fundCreator] = await ethers.getSigners();
        const FundManager = await ethers.getContractFactory("FundManager");
        fundManager = await FundManager.deploy();
    })

    it("Should create a new fund with true intial value", async function () {

        const createTx = await fundManager.connect(fundCreator).createFund(
            fundName, fundSupply, fundBasePrice, fundBaseUri);
        const txReceipt = await createTx.wait();
        const [fundOwner, fundId] = txReceipt.events[0].args;

        const FIRST_FUND_ID = 1;
        expect(fundId).to.be.equal(FIRST_FUND_ID);

        const fundAddress = await fundManager.getFund(fundId);
        expect(ethers.utils.isAddress(fundAddress)).to.be.true;

        const Fundraiser = await ethers.getContractFactory("Fundraiser");
        const fundraiser = Fundraiser.attach(fundAddress);
        const owner = await fundraiser.getFundOwner();
        const id = await fundraiser.getFundId();
        const name = await fundraiser.getFundName();
        const supply = await fundraiser.getSupply();
        const basePrice = await fundraiser.getBasePrice();

        expect(owner).to.be.equal(fundOwner);
        expect(id).to.be.equal(fundId);
        expect(name).to.be.equal(fundName);
        expect(supply).to.be.equal(fundSupply);
        expect(basePrice).to.be.equal(fundBasePrice);

    })
})