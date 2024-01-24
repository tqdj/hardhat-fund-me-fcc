const { assert, expect } = require("chai")
const { network, deployments, getNamedAccounts, ethers } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let FundMe
          let mockV3Aggregator
          let deployer
          const sendValue = "1000000000000000000"

          beforeEach(async function () {
              //自动执行所有含有all标签的deploy脚本
              await deployments.fixture(["all"])
              deployer = (await getNamedAccounts()).deployer
              //获得部署好的fundme合约
              FundMe = await ethers.getContract("FundMe", deployer)
              //以后每次调用合约，都会自动连接到deployer
              mockV3Aggregator = ethers.getContract(
                  "MockV3Aggregator",
                  deployer,
              )

              //console.log(FundMe)
          })

          describe("构造函数", async function () {
              it("mock喂价器正确部署", async function () {
                  const response = await FundMe.getPriceFeed()
                  assert.equal(response.address, mockV3Aggregator.address)
              })
          })

          describe("fund函数", async function () {
              it("检测到资助金额不足", async function () {
                  await expect(FundMe.fund()).to.be.revertedWith(
                      //revertWith是chai断言库和@nomiclabs/hardhat-ethers相互配合才可以用的函数，
                      //请保证他们的版本正确
                      "Didn't Send Enough",
                  )
              })

              it("资助后正确更新了资助记录", async function () {
                  await FundMe.fund({ value: sendValue })
                  const response = await FundMe.getFunderToAmount(deployer)
                  //FunderToAmount必须是public的
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("资助后资助方上榜", async function () {
                  await FundMe.fund({ value: sendValue })
                  const funder = await FundMe.getFunder(0) //注意是小括号
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw函数", async function () {
              beforeEach(async () => {
                  await FundMe.fund({ value: sendValue })
              })

              it("资金流向本人账户", async function () {
                  const startingFundMeBalance =
                      await FundMe.provider.getBalance(FundMe.address)
                  const startingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  const transactionResponse = await FundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  //从transactionRecipt获得 gasUsed,effectiveGasPrice
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)
                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address,
                  )
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      //如何获得gasCost
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                  )
              })

              it("有多个资助者时withdraw可以正常运作", async function () {
                  const accounts = await ethers.getSigners()
                  //获得当前网络上所有账户
                  //ethers.getSigners()和hre.getNamedAccounts()不同，
                  //getNamedAccounts得到的是hardhat.config,js里面的namedAccounts对象里的账户
                  //getSigners得到的是 hardhat.config,js里面的network里面存储的accounts

                  for (i = 1; i < 6; i++) {
                      //0是deployer
                      //让FundMe合约分别连上各个账号
                      const FundMeConnectedContract = await FundMe.connect(
                          accounts[i],
                      )
                      await FundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await FundMe.provider.getBalance(FundMe.address)
                  const startingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  const transactionResponse = await FundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  //从transactionRecipt获得 gasUsed,effectiveGasPrice
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)
                  const endingFundMeBalance = await FundMe.provider.getBalance(
                      FundMe.address,
                  )
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      //如何获得gasCost
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                  )

                  await expect(FundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getFunderToAmount(accounts[i].address),
                          0,
                      )
                  }
              })

              it("只允许本人withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectContract = await FundMe.connect(attacker)
                  await expect(
                      attackerConnectContract.withdraw(),
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })
      })
