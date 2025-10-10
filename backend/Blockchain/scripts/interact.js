const hre = require("hardhat");
const CryptoJS = require("crypto-js");

const SECRET_KEY = "mySecretKey123";

function encryptData(data) {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString(); // Base64 string
}

function decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    const simpleStorage = SimpleStorage.attach(contractAddress);

    // Encrypt
    const plainText = "Hello Blockchain!";
    const encrypted = encryptData(plainText); // string

    // Store as string (no Buffer!)
    const tx = await simpleStorage.setData(encrypted);
    await tx.wait();
    console.log("Encrypted data stored!");

    // Retrieve encrypted string
    const storedDataStr = await simpleStorage.getData();

    // Decrypt
    const decrypted = decryptData(storedDataStr);
    console.log("Decrypted data:", decrypted);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
