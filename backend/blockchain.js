import { ethers } from "ethers";
import { RPC_URL, CONTRACT_ADDRESS } from "./config/env.js";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const abi = [
  "function storeData(bytes32 dataHash) public",
  "function grantConsent(bytes32 dataHash, address requester) public",
  "function checkConsent(bytes32 dataHash, address requester) public view returns (bool)"
];

let cachedAccounts = null;
async function getAccounts() {
  if (!cachedAccounts) cachedAccounts = await provider.listAccounts();
  return cachedAccounts;
}

// Always use account string to get signer safely
async function getSigner(index = 0) {
  const accounts = await getAccounts();
  const account = accounts[index];

  if (!account || !ethers.isAddress(account)) {
    throw new Error(`Invalid Ethereum address at index ${index}: ${account}`);
  }

  return provider.getSigner(account);
}

// Connect to contract with proper signer
async function getContract() {
  const signer = await getSigner(); // default 0
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

// Store data on blockchain
export async function storeDataOnBlockchain(hash) {
  const contract = await getContract();
  const tx = await contract.storeData(hash);
  await tx.wait();
  return tx.hash;
}

// Grant consent to a specific account
export async function grantConsentOnBlockchain(hash, requesterIndex = 1) {
  const contract = await getContract();
  const accounts = await getAccounts();

  const requester = accounts[requesterIndex];
  if (!requester || !ethers.isAddress(requester)) throw new Error("Requester account not valid");

  const tx = await contract.grantConsent(hash, requester);
  await tx.wait();
  return tx.hash;
}

// Check consent for a specific account
export async function checkConsent(hash, requesterIndex = 1) {
  const contract = await getContract();
  const accounts = await getAccounts();

  const requester = accounts[requesterIndex];
  if (!requester || !ethers.isAddress(requester)) throw new Error("Requester account not valid");

  return await contract.checkConsent(hash, requester);
}