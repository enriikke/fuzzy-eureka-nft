const hre = require("hardhat");

async function main() {
  const Epic = await hre.ethers.getContractFactory("EpicNFT");
  const epic = await Epic.deploy();

  await epic.deployed();

  console.log("Contract deployed to:", epic.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
