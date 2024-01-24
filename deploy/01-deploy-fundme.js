const {
    networkconfig,
    developmentChain,
} = require("../helper-hardhat-config.js")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    //解构赋值,从hre对象中提取getNamedAccounts和deployments属性。
    const { deploy, log } = deployments
    //解构赋值，获得两个函数
    const { deployer } = await getNamedAccounts()
    //获得了deployer的账户，
    //此前我们是通过
    //  //hardhat里面的合约工厂会自动获得hardhat.config.js里的信息，并据此获得RPC和私钥
    //  const SimpleStorageFactory =
    //      await ethers.getContractFactory("SimpleStorage") //直接用contracts文件夹下的contract的名称字符串
    //  hardhat.config.js文件里的network配置来设置账户的

    // 实际上，在hardhat.config.js里面还有：
    // module.exports = {
    //     namedAccounts: {
    //       deployer: 0, // 这里的 0 表示使用帐户数组的第一个帐户作为 deployer
    //       owner: 1,    // 这里的 1 表示使用帐户数组的第二个帐户作为 owner
    //       // 其他命名帐户...
    //     },
    //     // 其他配置...
    //   };

    const chainId = network.config.chainId
    //network其实就是hardhat.config.js里的network

    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        //如果是本地区块链就使用虚拟喂价聚合器
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        //否则用官方喂价聚合器的API
        //networkConfig事先存放在 helper-hardhat-config.js 中
        ethUsdPriceFeedAddress = networkconfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    //返回一个部署好的合约对象FundMe,会被存放到ethers中
    const FundMe = await deploy("FundMe", {
        from: deployer,
        log: true,
        args: args, //传递给合约构造函数的参数
        waitConfirmations: network.config.blockConfirmations || 1, //自动等待 blockConfirmations 个区块确认
    })

    //如果不在本地区块链网络就需要自动验证
    if (!developmentChain.includes(network.name)) {
        await verify(FundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
//如果有fundme标签，只执行该操作
