//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Fundraiser.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract FundManager {

    address private baseFundraiserAddress;

    using Counters for Counters.Counter;
    Counters.Counter private fundCounter;
    mapping(uint256 => address) private fundList;
    event CreateFund(address owner, uint256 fundId);

    constructor() {
        Fundraiser fundraiser = new Fundraiser();
        baseFundraiserAddress = address(fundraiser);
    }

    function createFund(
        string memory name, 
        uint256 supply, 
        uint256 basePrice, 
        string memory baseURI) public returns (uint256) {

        fundCounter.increment();
        uint256 newFundId = fundCounter.current();
        address fundOwner = msg.sender;

        address fundraiserAddress = Clones.clone(baseFundraiserAddress);
        Fundraiser(fundraiserAddress).initialize(fundOwner, name, newFundId, supply, basePrice, baseURI);
        fundList[newFundId] = fundraiserAddress;
        emit CreateFund(fundOwner, newFundId);

        return newFundId;

    }

    function getFund(uint256 fundId) public view returns (address) {
        return fundList[fundId];
    }

    function getFundCounter() public view returns (uint256) {
        return fundCounter.current();
    }

}