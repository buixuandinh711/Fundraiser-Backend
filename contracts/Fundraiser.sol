//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Fundraiser is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 private fundId;
    string private fundName;
    address payable private fundOwner;
    uint256 private supply;
    uint256 private basePrice;
    bool private isOpenning;

    string private baseURI;

    event Fund(address funder, uint256 totalSent, uint256 tokenId);
    event Withdraw(uint256 amount);

    constructor(
        string memory _fundName,
        uint256 _fundId,
        uint256 _supply,
        uint256 _basePrice,
        string memory pBaseURI
    ) ERC721("Fund Token", "FUR") {
        isOpenning = true;
        fundId = _fundId;
        fundName = _fundName;
        fundOwner = payable(msg.sender);
        supply = _supply;
        basePrice = _basePrice;
        baseURI = pBaseURI;
    }

    function fund() public payable returns (uint256) {
        checkEnding();
        require(isOpenning);
        uint256 amount = msg.value;
        require(amount >= basePrice);

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        address funder = msg.sender;
        _safeMint(funder, newTokenId);

        emit Fund(funder, amount, newTokenId);

        return newTokenId;

    }

    function withdraw() public payable onlyOwner {
        checkEnding();
        require(!isOpenning);

        uint256 contractBalance = address(this).balance;

        emit Withdraw(contractBalance);

        fundOwner.transfer(contractBalance);
    }


    modifier onlyOwner {
        require(msg.sender == address(fundOwner));
        _;
    }


    function checkEnding() private {
        if (_tokenIds.current() == supply) {
            isOpenning = false;
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function getFundOpenState() public view returns (bool) {
        return isOpenning;
    }

    function getFundId() public view returns (uint256){
        return fundId;
    }

    function getFundOwner() public view returns (address) {
        return address(fundOwner);
    }

     function getSupply() public view returns (uint256){
        return supply;
    }

     function getBasePrice() public view returns (uint256){
        return basePrice;
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenIds.current();        
    }


}
