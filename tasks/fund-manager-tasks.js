const fs = require("fs/promises");
const { LOCAL_BLOCKCHAIN, DEPLOYMENT_DATA_PATH, formatOutput } = require("./utils")

task("deploy-fund-manager", "Deploy a new FundManager contract")
    .addOptionalParam(
        "deployer",
        "Index of the account in accounts list using to deploy contract",
        0,
        types.int)
    .setAction(async function ({ deployer }, hre) {

        const ethers = hre.ethers;
        const accounts = await ethers.getSigners();
        const accountIndex = deployer;

        if (accountIndex < 0 || accountIndex >= accounts.length) {
            console.log("Invalid index for deployer in accounts list!");
            return;
        }

        const FundManager = await ethers.getContractFactory("FundManager");
        const fundManager = await FundManager.connect(accounts[accountIndex]).deploy();
        await fundManager.deployed();

        const contractAddress = fundManager.address;

        if (!LOCAL_BLOCKCHAIN.includes(hre.network.name)) {
            let data;
            try {
                data = await fs.readFile(DEPLOYMENT_DATA_PATH);
            } catch {
                data = "[]"
            }
            const listInfo = JSON.parse(data);
            const contractInfo = {
                address: contractAddress,
                network: hre.network.name,
                deploy_time: Date.now()
            }
            listInfo.push(contractInfo);
            await fs.writeFile(DEPLOYMENT_DATA_PATH, JSON.stringify(listInfo));
        }

        console.log("Contract deployed at:", fundManager.address);
    });

task("list-fundmanager", "List last 10 created FundManager")
    .addFlag("all", "List all created FundManager")
    .setAction(async function ({ all }) {
        let data;
        try {
            data = await fs.readFile(DEPLOYMENT_DATA_PATH);
        } catch {
            console.log("No contract deployed yet!");
            return;
        }
        const listInfo = JSON.parse(data);
        let len = listInfo.length;
        if (!all) {
            len = len > 10 ? 10 : len
        }
        const output = function (no, address, network, date) {
            return formatOutput(no, 4) + formatOutput(address, 45)
                + formatOutput(network, 10) + formatOutput(date, 60)
        }
        console.log(output("no", "address", "network", "deploy date"));
        for (let i = 0; i < len; i++) {
            const info = listInfo[i]
            const date = new Date(info.deploy_time).toString();
            console.log(output(i, info.address, info.network, date));
        }
    })

task("list-fundraiser", "List created Fundraiser of a FundManager")
    .addParam("address", "Address of the FundManager")
    .setAction(async function ({ address }, { ethers }) {
        if (!ethers.utils.isAddress(address)) {
            console.log("Invalide address!");
            return;
        }
        const FundManager = await ethers.getContractFactory("FundManager");
        const fundManager = FundManager.attach(address);
        const fundraiserAmount = await fundManager.getFundCounter();
        for (let i = 0; i < fundraiserAmount; i++) {
            const addr = await fundManager.getFund(i);
            console.log(addr);
        }
    })