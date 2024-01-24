const { network } = require("hardhat")
const {
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")
require("dotenv").config()
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //如果network.name是hardhat或localhost，说明没有喂价服务，此时需要启动mock喂价聚合器
    if (
        developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Local network detected! Deploying mocks...")
        const MockV3Aggregator = await deploy("MockV3Aggregator", {
            //contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("-----------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
//设置一个tag，yarn hardhat deploy --tags mocks
//只执行该Deploy
