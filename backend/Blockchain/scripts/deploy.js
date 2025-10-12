const { ethers } = require("hardhat");

async function main() {
  // Get contract factory
  const ConsentRegistry = await ethers.getContractFactory("ConsentRegistry");

  // Deploy contract
  const consentRegistry = await ConsentRegistry.deploy();

  // Wait for deployment
  await consentRegistry.deployed();

  console.log("ConsentRegistry deployed to:", consentRegistry.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
