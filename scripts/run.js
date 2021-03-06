const hre = require("hardhat");

async function main() {
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const Epic = await hre.ethers.getContractFactory("EpicNFT");
  const epic = await Epic.deploy();

  await epic.deployed();

  console.log("Contract deployed to:", epic.address);

  const txn = await epic.makeAnEpicNFT()
  await txn.wait() // Wait for it to be mined.

  const num = await epic.getTotalNFTsMintedSoFar()
  console.log("Total minted NFTs so far: ", Number(num))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
