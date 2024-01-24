// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//自定义错误
error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant minUSD = 50 * 1e18;
    //设置为private减少gas
    address[] private funders;
    mapping(address => uint256) private FunderToAmount;
    address private immutable i_owner;
    //将喂价接口对象设置为全局变量
    AggregatorV3Interface private immutable priceFeed;

    modifier only_owner() {
        //require(msg.sender==i_owner,"Sender is not owner!");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        //priceFeedAddress将会在合约部署时获得
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= minUSD,
            "Didn't Send Enough"
        );
        funders.push(msg.sender);
        FunderToAmount[msg.sender] += msg.value;
    }

    function withdraw() public only_owner {
        address[] memory m_funders = funders;
        //将funders从storage引入memory，减少SSLOAD操作码，有效减少gas

        for (
            uint256 funder_index = 0;
            funder_index < m_funders.length;
            funder_index++
        ) {
            FunderToAmount[m_funders[funder_index]] = 0;
        }

        funders = new address[](0);

        (bool call_success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(call_success, "call failed!");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getFunderToAmount(address funder) public view returns (uint256) {
        return FunderToAmount[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
