import { ethers } from "ethers";
import { RPC_URL, CONTRACT_ADDRESS } from "./config/env.js";

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Updated ABI with safer functions
const abi = [
  "function storeData(bytes32 dataHash) public",
  "function grantConsent(bytes32 dataHash, address requester) public",
  "function checkConsent(bytes32 dataHash, address requester) public view returns (bool)",
  // Remove getDataOwner if it's causing issues, or use a safer approach
];

let cachedAccounts = null;
let isContractVerified = false;

async function verifyContractDeployment() {
  try {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      console.error('❌ CONTRACT NOT DEPLOYED: No contract found at address:', CONTRACT_ADDRESS);
      return false;
    }
    console.log('✅ Contract is deployed at:', CONTRACT_ADDRESS);
    isContractVerified = true;
    return true;
  } catch (error) {
    console.error('Error verifying contract:', error);
    return false;
  }
}

async function getAccounts() {
  if (!cachedAccounts) {
    try {
      const accounts = await provider.listAccounts();
      cachedAccounts = accounts.map(account => {
        if (typeof account === 'string' && ethers.isAddress(account)) {
          return account;
        } else if (account && typeof account === 'object' && account.address) {
          return account.address;
        } else {
          const addressStr = String(account);
          return ethers.isAddress(addressStr) ? addressStr : null;
        }
      }).filter(account => account !== null);
      
      if (cachedAccounts.length === 0) {
        throw new Error("No valid Ethereum accounts found from provider");
      }
      
      console.log(`📋 Available accounts: ${cachedAccounts.length}`);
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }
  return cachedAccounts;
}

async function getSigner(index = 0) {
  const accounts = await getAccounts();
  
  // Validate that index is a number
  const signerIndex = Number(index);
  if (isNaN(signerIndex) || signerIndex < 0) {
    throw new Error(`Invalid signer index: ${index}. Must be a number.`);
  }
  
  if (signerIndex >= accounts.length) {
    throw new Error(`Account index ${signerIndex} not available. Only ${accounts.length} accounts found.`);
  }
  
  const account = accounts[signerIndex];
  return provider.getSigner(account);
}

async function getContract(signerIndex = 0) {
  if (!isContractVerified) {
    const isDeployed = await verifyContractDeployment();
    if (!isDeployed) {
      throw new Error(`Contract not deployed at ${CONTRACT_ADDRESS}. Please deploy the contract first.`);
    }
  }
  
  const signer = await getSigner(signerIndex);
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

function stringToBytes32(str) {
  return ethers.keccak256(ethers.toUtf8Bytes(str));
}

// Safer data existence check without using getDataOwner
async function dataExists(dataHash) {
  try {
    const contract = await getContract();
    // Try to check consent with zero address - if it doesn't revert, data might exist
    await contract.checkConsent.staticCall(dataHash, ethers.ZeroAddress);
    return true;
  } catch (error) {
    // If checkConsent reverts, data might not exist or there might be other issues
    return false;
  }
}

// Store data on blockchain - simplified version
export async function storeDataOnBlockchain(data, signerIndex = 0) {
  try {
    console.log(`🔧 storeDataOnBlockchain called with:`, { data, signerIndex });
    
    const contract = await getContract(signerIndex);
    const accounts = await getAccounts();
    const signerAddress = accounts[Number(signerIndex)];
    
    const dataHash = stringToBytes32(data);
    
    console.log(`💾 Storing data: "${data}"`);
    console.log(`🔑 Data hash: ${dataHash}`);
    console.log(`👤 Stored by: ${signerAddress} (index: ${signerIndex})`);
    
    // Skip existence check since getDataOwner is broken
    console.log(`⏳ Storing data on blockchain...`);
    
    try {
      const tx = await contract.storeData(dataHash);
      const receipt = await tx.wait();
      
      console.log(`✅ Data stored successfully. Transaction: ${receipt.hash}`);
      
      return {
        transactionHash: receipt.hash,
        data: data,
        dataHash: dataHash,
        owner: signerAddress, // Assume the signer is the owner
        storedBy: signerAddress
      };
    } catch (txError) {
      // If storeData fails, check if it's because data already exists
      if (txError.reason?.includes('already exists') || txError.reason?.includes('already stored')) {
        throw new Error(`Data already exists on blockchain. Hash: ${dataHash}`);
      }
      throw txError;
    }
  } catch (error) {
    console.error('❌ Error storing data on blockchain:', error);
    throw error;
  }
}

// Grant consent to a specific account
export async function grantConsentOnBlockchain(data, requesterAddress = null, ownerSignerIndex = 0) {
  try {
    console.log(`🔧 grantConsentOnBlockchain called with:`, { data, requesterAddress, ownerSignerIndex });
    
    const contract = await getContract(ownerSignerIndex);
    const accounts = await getAccounts();
    const ownerAddress = accounts[Number(ownerSignerIndex)];

    let requester = requesterAddress;
    
    if (!requester || !ethers.isAddress(requester)) {
      // Use a different account than the owner if available
      requester = accounts.find((account, index) => index !== Number(ownerSignerIndex)) || accounts[0];
    }

    const dataHash = stringToBytes32(data);
    
    console.log(`🔑 Attempting to grant consent for data: "${data}"`);
    console.log(`🔑 Data hash: ${dataHash}`);
    console.log(`👤 Caller address: ${ownerAddress}`);
    console.log(`👥 Granting to: ${requester}`);
    
    // Skip owner verification since getDataOwner is broken
    console.log(`⏳ Granting consent...`);
    
    const tx = await contract.grantConsent(dataHash, requester);
    const receipt = await tx.wait();
    
    // Verify consent was granted
    try {
      const hasConsent = await contract.checkConsent(dataHash, requester);
      console.log(`✅ Consent granted successfully. Verification: ${hasConsent}`);
      
      return {
        transactionHash: receipt.hash,
        data: data,
        dataHash: dataHash,
        owner: ownerAddress,
        grantedTo: requester,
        consentVerified: hasConsent
      };
    } catch (checkError) {
      // If checkConsent fails, still return success but with unknown verification
      console.log(`⚠️ Consent granted but verification failed:`, checkError.message);
      return {
        transactionHash: receipt.hash,
        data: data,
        dataHash: dataHash,
        owner: ownerAddress,
        grantedTo: requester,
        consentVerified: null
      };
    }
  } catch (error) {
    console.error('❌ Error granting consent on blockchain:', error);
    
    if (error.reason?.includes('Only owner can grant') || error.message?.includes('not the data owner')) {
      throw new Error(`Permission denied: Only the data owner can grant consent. ${error.message}`);
    }
    
    if (error.reason?.includes('Not the data owner')) {
      throw new Error(`Permission denied: You are not the data owner. ${error.message}`);
    }
    
    throw error;
  }
}

// Check consent for a specific account
export async function checkConsent(data, requesterAddress = null, signerIndex = 0) {
  try {
    console.log(`🔧 checkConsent called with:`, { data, requesterAddress, signerIndex });
    
    const contract = await getContract(signerIndex);
    const accounts = await getAccounts();

    let requester = requesterAddress;
    
    if (!requester || !ethers.isAddress(requester)) {
      // Use a different account than the signer if available
      requester = accounts.find((account, index) => index !== Number(signerIndex)) || accounts[0];
    }

    const dataHash = stringToBytes32(data);
    
    console.log(`🔍 Checking consent for data: "${data}"`);
    console.log(`🔑 Data hash: ${dataHash}`);
    console.log(`👥 Checking for requester: ${requester}`);
    
    try {
      const result = await contract.checkConsent(dataHash, requester);
      console.log(`✅ Consent check completed: ${result}`);
      
      return {
        hasConsent: result,
        data: data,
        dataHash: dataHash,
        requester: requester,
        dataOwner: null, // Can't determine owner due to contract issue
        exists: true
      };
    } catch (error) {
      // If checkConsent fails, assume no consent
      console.log(`⚠️ Consent check failed, assuming no consent:`, error.message);
      return {
        hasConsent: false,
        data: data,
        dataHash: dataHash,
        requester: requester,
        dataOwner: null,
        exists: false
      };
    }
  } catch (error) {
    console.error('❌ Error checking consent:', error);
    return { 
      hasConsent: false, 
      error: 'Contract error: ' + error.message,
      exists: false
    };
  }
}

// Quick function to store your existing hash
export async function storeExistingHash(hash, signerIndex = 0) {
  try {
    // Validate that it's a proper bytes32 hash
    if (!hash.startsWith('0x') || hash.length !== 66) {
      throw new Error('Invalid hash format. Should be 0x followed by 64 hex characters');
    }
    
    console.log(`💾 Storing existing hash: ${hash}`);
    
    const contract = await getContract(signerIndex);
    const accounts = await getAccounts();
    const signerAddress = accounts[Number(signerIndex)];
    
    console.log(`⏳ Storing hash on blockchain...`);
    
    const tx = await contract.storeData(hash);
    const receipt = await tx.wait();
    
    console.log(`✅ Hash stored successfully`);
    
    return {
      transactionHash: receipt.hash,
      data: hash,
      dataHash: hash,
      owner: signerAddress,
      storedBy: signerAddress
    };
  } catch (error) {
    console.error('❌ Error storing existing hash:', error);
    throw error;
  }
}

// Utility function to check deployment status
export async function getDeploymentStatus() {
  return await verifyContractDeployment();
}

// Get account information
export async function getAccountInfo() {
  const accounts = await getAccounts();
  return {
    totalAccounts: accounts.length,
    accounts: accounts.map((account, index) => ({
      index,
      address: account,
      isValid: ethers.isAddress(account)
    }))
  };
}

// Verify contract on startup
verifyContractDeployment().then(success => {
  if (success) {
    console.log('✅ Blockchain connection ready');
  } else {
    console.log('❌ Contract not deployed - please run deployment script');
  }
});