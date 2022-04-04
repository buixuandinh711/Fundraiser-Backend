//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Fundraiser is ERC721URIStorage {

    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    uint256 private fundId;
    string private fundName;
    address private fundOwner;
    uint256 private supply;
    uint256 private basePrice;
    bool private isOpenning;

    string private baseURI;

    event Fund(address funder, uint256 totalSent, uint256 tokenId);
    event Withdraw(uint256 amount);
    event EndFunding();

    constructor(
        address _fundOwner,
        string memory _fundName,
        uint256 _fundId,
        uint256 _supply,
        uint256 _basePrice,
        string memory pBaseURI
    ) ERC721("Fund Token", "FUR") {
        fundOwner = _fundOwner;
        fundId = _fundId;
        fundName = _fundName;
        supply = _supply;
        basePrice = _basePrice;
        baseURI = pBaseURI;
        isOpenning = true;
    }

    function fund() public payable returns (uint256) {
        require(isOpenning, "This fundraiser is ended!");
        uint256 amount = msg.value;
        require(amount >= basePrice);

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        address funder = msg.sender;
        _safeMint(funder, newTokenId);
        _setTokenURI(newTokenId, newTokenId.toString());

        checkEnding();
        emit Fund(funder, amount, newTokenId);

        return newTokenId;

    }

    function withdraw() public payable onlyOwner {
        checkEnding();
        require(!isOpenning, "This fundraiser is't ended!");

        uint256 contractBalance = address(this).balance;

        emit Withdraw(contractBalance);

        payable(fundOwner).transfer(contractBalance);
    }


    modifier onlyOwner {
        require(msg.sender == fundOwner, "Not the owner!");
        _;
    }


    function checkEnding() private {
        if (isOpenning &&  _tokenIds.current() == supply) {
            isOpenning = false;
            emit EndFunding();
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

        function getFundName() public view returns (string memory){
        return fundName;
    }

    function getFundOwner() public view returns (address) {
        return fundOwner;
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
