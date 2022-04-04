const { ethers } = require("hardhat");
const { expect } = require("chai");

describe ("Test contracts with testnet", function() {

    

    let fundManager;
    let manager, fundCreator;
    let fundId;
    let fundraiser;

    const fundName = "New Bphone";
    const fundSupply = 1;
    const fundBasePrice = ethers.utils.parseUnits("1.0", "gwei");
    const fundBaseUri = "ipfs://abcxyz123";
    const fundAmount = ethers.utils.parseUnits("0.01", "ether");

    before (async function() {

        const networkName = hre.network.name;
        if (networkName == "hardhat") {
            this.skip();
        }

        [manager, fundCreator] = await ethers.getSigners();
        const FundManager = await ethers.getContractFactory("FundManager");
        fundManager = await FundManager.connect(manager).deploy();
        await fundManager.deployed();
    })

    it ("Should create a new fundraiser", async function() {
        const createTx = await fundManager.connect(fundCreator).createFund(
            fundName, fundSupply, fundBasePrice, fundBaseUri
        )
        const txReceipt = await createTx.wait();
        fundId = txReceipt.events[0].args.fundId;
        expect(fundId).to.be.equal(1);
    })

    it("Should make funder can fund and receipt a token and close the fund", async function() {

        const funder = manager;
        const fundAddress = await fundManager.getFund(fundId);
        const Fundraiser = await ethers.getContractFactory("Fundraiser");
        fundraiser = Fundraiser.attach(fundAddress);

        const fundTx = await fundraiser.connect(funder).fund({value: fundAmount});
        const txReceipt = await fundTx.wait();
        const txEvents = txReceipt.events;
        const [fundEvent] = txEvents.filter(e => e.event == "Fund");
        const tokenId = fundEvent.args.tokenId;
        expect(tokenId).to.be.equal(1);
        const openState = await fundraiser.getFundOpenState();
        expect(openState).to.be.false;

    })

    it ("Should make owner can withdraw amount funded", async function() {
        const owner = fundCreator;
        const notTheOwner = manager;
        const beforeBalance = await owner.getBalance();

        await expect(fundraiser.connect(notTheOwner).withdraw())
            .to.be.revertedWith("Not the owner!");

        const withdrawTx = await fundraiser.connect(owner).withdraw();
        const txReceipt = await withdrawTx.wait();
        const amountFunded = txReceipt.events[0].args.amount;
        const afterBalance = await owner.getBalance();
        expect(amountFunded.eq(fundAmount)).to.be.true;
        expect(afterBalance.gt(beforeBalance)).to.be.true;
    })

})