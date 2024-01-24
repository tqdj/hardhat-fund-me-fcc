async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified")
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    verify,
}
