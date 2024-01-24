// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
        //price虽然是整数，但其实它的后8位是在小数后面的
        //现在放大到10的18次方数量级
    }

    //ethAmount的单位是wei
    //导入喂价器和以太币数量，获得对应的美元数量（*10的18次方）
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        // 使用uint256转换确保正确的数学运算
        return (ethPrice * ethAmount) / 1e18;
    }
}
