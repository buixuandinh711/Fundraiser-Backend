const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Fundraiser test", function() {

   let fundraiser;

   before (async function() {

      const Fundraiser = await ethers.getContractFactory("Fundraiser");
      fundraiser = await Fundraiser.deploy("")

   })

})