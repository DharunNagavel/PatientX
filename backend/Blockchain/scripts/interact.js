const { ethers } = require("hardhat");

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xYourDeployedContractAddressHere";

async function main() {
  const [owner, user1] = await ethers.getSigners();

  const ConsentRegistry = await ethers.getContractFactory("ConsentRegistry");
  const consentRegistry = await ConsentRegistry.attach(CONTRACT_ADDRESS);

  // 1. Store data hash
  const dataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MySecretData"));
  let tx = await consentRegistry.connect(owner).storeData(dataHash);
  await tx.wait();
  console.log("Data stored with hash:", dataHash);

  // 2. Grant consent to user1
  tx = await consentRegistry.connect(owner).grantConsent(dataHash, user1.address);
  await tx.wait();
  console.log("Consent granted to:", user1.address);

  // 3. Check consent
  const hasConsent = await consentRegistry.checkConsent(dataHash, user1.address);
  console.log("Does user1 have consent?", hasConsent);
}

main().catch(console.error);
