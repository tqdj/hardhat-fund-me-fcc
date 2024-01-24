require("solhint")
require("hardhat-deploy")
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-waffle")
//require("@nomiclabs/hardhat-etherscan")
require("@nomicfoundation/hardhat-verify")
require("ethereum-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
const apiKey = process.env.ETHERSCAN_API_KEY
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },

    //设置network
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            gasPrice: 130000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY], //可以有多个account
            chainId: 11155111,
            blockConfirmations: 6, //部署合约时等待6个区块确认，后面deploy函数会用到
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },

    //@nomicfoundation/hardhat-verify
    etherscan: {
        apiKey: apiKey, //意义不明，估计只是提供了验证权限，有了api才能用自动验证的工具包
    },
    sourcify: {
        enabled: true,
    },

    //用于给hre的GetNamedAccounts函数使用
    namedAccounts: {
        deployer: {
            default: 0, // 这里默认会将第一个账户作为 deployer
            1: 0, // // 在主网（chainId 为 1）上也会将第一个账户作为 deployer
        },
    },

    gasReporter: {
        enable: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
}
