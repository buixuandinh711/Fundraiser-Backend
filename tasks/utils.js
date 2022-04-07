const LOCAL_BLOCKCHAIN = ["hardhat"];
const DEPLOYMENT_DATA_PATH = "./deployments/FundManager.json"

const formatOutput = function(str, outputLength) {
    str = str.toString();
    const stringLen = str.length;
    if (stringLen > outputLength) {
        throw "Length of string is longer then output length";
    }
    return str + " ".repeat(outputLength - stringLen);
}

module.exports = {
    LOCAL_BLOCKCHAIN,
    DEPLOYMENT_DATA_PATH,
    formatOutput
}