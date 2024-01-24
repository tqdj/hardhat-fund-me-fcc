const networkconfig = {
    11155111 /*chainId*/: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    31337: {
        name: "localhost",
    },
}
//如果network.name是hardhat或localhost，说明没有喂价服务，此时需要启动mock喂价聚合器
const developmentChain = ["hardhat", "localhost"]

const DECIMALS = "8" //(8位小数)
const INITIAL_ANSWER = "200000000000" //(初始的价格，2000美元)
//满足mockV3Aggregator(喂价聚合器)的构造函数的需求
// constructor(
//     uint8 _decimals,
//     int256 _initialAnswer
//   ) public {
//     decimals = _decimals;
//     updateAnswer(_initialAnswer);
//    }

module.exports = {
    networkconfig,
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
}
