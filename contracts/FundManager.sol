//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Fundraiser.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FundManager {

    using Counters for Counters.Counter;
    Counters.Counter private fundIds;
    mapping(uint256 => address) private fundList;

    function createFund(
        string memory name, 
        uint256 supply, 
        uint256 basePrice, 
        string memory baseURI) public returns (uint256) {

        fundIds.increment();
        uint256 newFundId = fundIds.current();

        Fundraiser fund = new Fundraiser(name, newFundId, supply, basePrice, baseURI);
        fundList[newFundId] = address(fund);

        return newFundId;

    }

    function getFund(uint256 fundId) public view returns (address) {
        return fundList[fundId];
    }

}