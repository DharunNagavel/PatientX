import { ethers } from "ethers";
import { RPC_URL, CONTRACT_ADDRESS } from "./config/env.js";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const abi = [
  "function storeData(bytes32 dataHash) public",
  "function grantConsent(bytes32 dataHash, address requester) public",
  "function checkConsent(bytes32 dataHash, address requester) public view returns (bool)",
];

let cachedAccounts = null;
let isContractVerified = false;

// Hardhat default account #0 private key (well-known for local development)
const HARDHAT_DEPLOYER_PRIVATE_KEY = process.env.HARDHAT_DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Check if network is ready and has accounts with balance
async function checkNetworkReadiness() {
  try {
    console.log('🔍 Checking network readiness...');
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Check if we have any accounts with balance
    const defaultAccounts = await provider.listAccounts();
    console.log(`📋 Default accounts available: ${defaultAccounts.length}`);
    
    if (defaultAccounts.length > 0) {
      const firstAccountBalance = await provider.getBalance(defaultAccounts[0]);
      console.log(`💰 First default account balance: ${ethers.formatEther(firstAccountBalance)} ETH`);
      
      if (firstAccountBalance > 0) {
        console.log('✅ Network is ready with funded accounts');
        return true;
      }
    }
    
    console.log('⚠️ Network may not be ready or accounts have no balance');
    return false;
  } catch (error) {
    console.error('❌ Network readiness check failed:', error);
    return false;
  }
}

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

// Dynamic Hardhat accounts (UPDATED)
async function getAccounts() {
  if (!cachedAccounts) {
    console.log("🔍 Fetching accounts from Hardhat provider...");

    const defaultAccounts = await provider.listAccounts();

    const accounts = [];
    for (let i = 0; i < defaultAccounts.length; i++) {
      const wallet = await provider.getSigner(i);

      accounts.push({
        index: i,
        address: defaultAccounts[i],
        privateKey: null,
        wallet: wallet,
        userId: i + 1
      });
    }

    cachedAccounts = accounts;
  }
  return cachedAccounts;
}


// Enhanced user ID validation with better error messages and debugging
function validateUserId(userId, functionName = "function") {
  console.log(`🔍 validateUserId called:`, { userId, functionName, type: typeof userId });
  
  if (userId === undefined || userId === null) {
    throw new Error(`Invalid user ID in ${functionName}: user ID is undefined or null`);
  }
  
  // Handle both string and number inputs more robustly
  let userInt;
  if (typeof userId === 'string') {
    userInt = parseInt(userId.trim());
    if (userId.trim() === '') {
      throw new Error(`Invalid user ID in ${functionName}: empty string provided`);
    }
  } else if (typeof userId === 'number') {
    userInt = userId;
  } else {
    throw new Error(`Invalid user ID in ${functionName}: "${userId}" has unsupported type ${typeof userId}`);
  }
  
  if (isNaN(userInt)) {
    throw new Error(`Invalid user ID in ${functionName}: "${userId}" is not a valid number`);
  }
  
  if (userInt < 1) {
    throw new Error(`Invalid user ID in ${functionName}: "${userId}" must be a positive number (1-20). Received: ${userInt}`);
  }
  
  if (cachedAccounts && userInt > cachedAccounts.length) {
  throw new Error(
    `Invalid user ID in ${functionName}: "${userInt}" exceeds available accounts (${cachedAccounts.length})`
  );
}
  
  console.log(`✅ User ID validated: ${userInt} for ${functionName}`);
  return userInt;
}

// Get signer by USER ID (not account index)
async function getSignerByUserId(userId) {
  const accounts = await getAccounts();
  
  const userInt = validateUserId(userId, "getSignerByUserId");
  
  // Find account mapped to this user ID
  const account = accounts.find(acc => acc.userId === userInt);
  
  if (!account) {
    throw new Error(`No account mapped for user ID ${userId}. Available users: 1-${accounts.length}`);
  }
  
  console.log(`🔗 User ID ${userId} mapped to Account ${account.index} (${account.address})`);
  return account.wallet;
}

// Get signer by account index (for backward compatibility)
async function getSigner(index = 0) {
  const accounts = await getAccounts();
  
  const signerIndex = Number(index);
  if (isNaN(signerIndex) || signerIndex < 0) {
    throw new Error(`Invalid signer index: ${index}. Must be a number.`);
  }
  
  if (signerIndex >= accounts.length) {
    throw new Error(`Account index ${signerIndex} not available. Only ${accounts.length} accounts found.`);
  }
  
  const account = accounts[signerIndex];
  return account.wallet;
}

// Get contract with user ID (preferred method)
async function getContractByUserId(userId) {
  if (!isContractVerified) {
    const isDeployed = await verifyContractDeployment();
    if (!isDeployed) {
      throw new Error(`Contract not deployed at ${CONTRACT_ADDRESS}. Please deploy the contract first.`);
    }
  }
  
  const signer = await getSignerByUserId(userId);
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

// Get contract with account index (for backward compatibility)
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

// Batch funding function with proper nonce management
async function fundAccountsBatch() {
  try {
    console.log('💰 Batch funding accounts with ETH...');
    const accounts = await getAccounts();
    
    let funder;
    try {
      funder = new ethers.Wallet(HARDHAT_DEPLOYER_PRIVATE_KEY, provider);
    } catch (funderError) {
      funder = await getSigner(0);
    }
    
    const funderBalance = await provider.getBalance(funder.address);
    console.log(`👤 Funder account: ${funder.address} (balance: ${ethers.formatEther(funderBalance)} ETH)`);
    
    if (funderBalance === 0n) {
      console.log('❌ Funder account has 0 ETH balance');
      return false;
    }
    
    // Get unfunded accounts
    const unfundedAccounts = [];
    for (const account of accounts) {
      const balance = await provider.getBalance(account.address);
      if (balance < ethers.parseEther("0.1")) {
        unfundedAccounts.push(account);
      }
    }
    
    console.log(`📋 Found ${unfundedAccounts.length} unfunded accounts`);
    
    if (unfundedAccounts.length === 0) {
      console.log('✅ All accounts already funded');
      return true;
    }
    
    // Fund accounts one by one with proper nonce management
    let fundedCount = 0;
    let currentNonce = await provider.getTransactionCount(funder.address);
    
    for (const account of unfundedAccounts) {
      console.log(`   Funding User ${account.userId} with nonce ${currentNonce}...`);
      
      try {
        const tx = await funder.sendTransaction({
          to: account.address,
          value: ethers.parseEther("10.0"),
          nonce: currentNonce
        });
        
        console.log(`   📝 Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ Funded User ${account.userId} with 10 ETH`);
        fundedCount++;
        currentNonce++;
        
        // Small delay to prevent nonce issues
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.log(`   ⚠️ Could not fund User ${account.userId}:`, error.message);
        
        // Update nonce and skip this account
        currentNonce = await provider.getTransactionCount(funder.address);
        console.log(`   🔢 Nonce updated to: ${currentNonce}, skipping User ${account.userId}`);
      }
    }
    
    console.log(`✅ Batch funding completed. Funded ${fundedCount} accounts`);
    return fundedCount > 0;
  } catch (error) {
    console.error('❌ Error in batch funding:', error);
    return false;
  }
}

// Individual funding function with proper nonce management
async function fundAccounts() {
  try {
    console.log('💰 Funding accounts with ETH...');
    const accounts = await getAccounts();
    
    // Use the known Hardhat deployer account
    let funder;
    let funderBalance;
    
    try {
      funder = new ethers.Wallet(HARDHAT_DEPLOYER_PRIVATE_KEY, provider);
      funderBalance = await provider.getBalance(funder.address);
      console.log(`👤 Funder account: ${funder.address} (balance: ${ethers.formatEther(funderBalance)} ETH)`);
      
      if (funderBalance === 0n) {
        console.log('❌ Funder account has 0 ETH balance');
        return false;
      }
    } catch (funderError) {
      console.log('❌ Cannot access funder account, trying default accounts...');
      
      // Fallback to default accounts
      const defaultAccounts = await provider.listAccounts();
      if (defaultAccounts.length === 0) {
        console.log('❌ No default accounts found with ETH');
        return false;
      }
      
      funder = await getSigner(0); // Use first account as funder
      funderBalance = await provider.getBalance(funder.address);
      console.log(`👤 Using default funder: ${funder.address} (balance: ${ethers.formatEther(funderBalance)} ETH)`);
      
      if (funderBalance === 0n) {
        console.log('❌ Default funder also has 0 ETH balance');
        return false;
      }
    }
    
    let fundedCount = 0;
    let currentNonce = await provider.getTransactionCount(funder.address);
    
    console.log(`🔢 Starting with nonce: ${currentNonce}`);
    
    // Process accounts sequentially with proper nonce management
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const balance = await provider.getBalance(account.address);
      
      // If balance is less than 0.1 ETH, fund it
      if (balance < ethers.parseEther("0.1")) {
        console.log(`   Funding Account ${i} (User ${account.userId}) with nonce ${currentNonce}...`);
        
        try {
          const tx = await funder.sendTransaction({
            to: account.address,
            value: ethers.parseEther("10.0"), // Send 10 ETH
            nonce: currentNonce
          });
          
          console.log(`   📝 Transaction sent: ${tx.hash}`);
          await tx.wait();
          console.log(`   ✅ Funded User ${account.userId} with 10 ETH`);
          fundedCount++;
          currentNonce++; // Increment nonce only after successful transaction
          
        } catch (fundError) {
          console.log(`   ⚠️ Could not fund User ${account.userId}:`, fundError.message);
          
          // If nonce error, try to get current nonce and retry
          if (fundError.message.includes('nonce') || fundError.code === 'NONCE_EXPIRED') {
            console.log(`   🔄 Nonce error detected, updating nonce...`);
            currentNonce = await provider.getTransactionCount(funder.address);
            console.log(`   🔢 Updated nonce to: ${currentNonce}`);
            
            // Try one more time with updated nonce
            try {
              const retryTx = await funder.sendTransaction({
                to: account.address,
                value: ethers.parseEther("10.0"),
                nonce: currentNonce
              });
              
              console.log(`   📝 Retry transaction sent: ${retryTx.hash}`);
              await retryTx.wait();
              console.log(`   ✅ Funded User ${account.userId} with 10 ETH (after retry)`);
              fundedCount++;
              currentNonce++;
            } catch (retryError) {
              console.log(`   ❌ Failed to fund User ${account.userId} after retry:`, retryError.message);
            }
          }
        }
        
        // Small delay between transactions to avoid nonce conflicts
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        console.log(`   ✅ User ${account.userId} already has ${ethers.formatEther(balance)} ETH`);
      }
    }
    
    console.log(`✅ Account funding completed. Funded ${fundedCount} accounts`);
    return fundedCount > 0;
  } catch (error) {
    console.error('❌ Error funding accounts:', error);
    return false;
  }
}

// Check account balances
async function checkAccountBalances() {
  try {
    const accounts = await getAccounts();
    console.log('💰 Checking account balances...');
    
    const balances = [];
    
    for (const account of accounts) {
      const balance = await provider.getBalance(account.address);
      const balanceEth = ethers.formatEther(balance);
      
      console.log(`   Account ${account.index} (User ${account.userId}): ${balanceEth} ETH`);
      
      balances.push({
        userId: account.userId,
        accountIndex: account.index,
        address: account.address,
        balance: balanceEth + ' ETH',
        hasFunds: balance > ethers.parseEther("0.1") // At least 0.1 ETH
      });
    }
    
    return balances;
  } catch (error) {
    console.error('Error checking balances:', error);
    throw error;
  }
}

// Improved ensure accounts funded with better error handling
async function ensureAccountsFunded() {
  try {
    console.log('🔍 Checking account balances...');
    const balances = await checkAccountBalances();
    const unfundedAccounts = balances.filter(acc => !acc.hasFunds);
    
    if (unfundedAccounts.length > 0) {
      console.log(`⚠️ Found ${unfundedAccounts.length} unfunded accounts, auto-funding...`);
      
      // Try batch funding first, fallback to individual funding
      let success = await fundAccountsBatch();
      if (!success) {
        console.log('🔄 Batch funding failed, trying individual funding...');
        success = await fundAccounts();
      }
      
      if (!success) {
        console.log('❌ Auto-funding failed, please fund accounts manually');
        throw new Error('Accounts have insufficient funds and auto-funding failed');
      }
      
      // Verify funding worked
      console.log('🔍 Verifying account funding...');
      const newBalances = await checkAccountBalances();
      const stillUnfunded = newBalances.filter(acc => !acc.hasFunds);
      
      if (stillUnfunded.length > 0) {
        console.log(`❌ Still ${stillUnfunded.length} unfunded accounts after funding attempt`);
        
        // Log which accounts are still unfunded
        stillUnfunded.forEach(acc => {
          console.log(`   ❌ User ${acc.userId} (${acc.address}): ${acc.balance}`);
        });
        
        throw new Error('Account funding verification failed');
      } else {
        console.log('✅ All accounts successfully funded');
      }
    } else {
      console.log('✅ All accounts have sufficient funds');
    }
  } catch (error) {
    console.error('❌ Error in ensureAccountsFunded:', error);
    throw error;
  }
}

// Debug function to help identify user ID issues
function debugUserIds(ownerUserId, requesterUserId, source = "unknown") {
  console.log('🐛 DEBUG User IDs:', {
    source,
    ownerUserId,
    requesterUserId,
    ownerType: typeof ownerUserId,
    requesterType: typeof requesterUserId,
    ownerValue: ownerUserId,
    requesterValue: requesterUserId
  });
  
  // Check if values are coming as 0
  if (ownerUserId === 0 || requesterUserId === 0) {
    console.log('🚨 ZERO DETECTED - This indicates a problem in the controller');
    console.log('💡 Possible causes:');
    console.log('   - Array index being used instead of user ID');
    console.log('   - Missing user ID in request body');
    console.log('   - Incorrect parameter extraction in controller');
  }
}

// Store data on blockchain using USER ID - UPDATED WITH RETRY LOGIC
async function storeDataOnBlockchain(data, userId) {
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`🔧 storeDataOnBlockchain attempt ${retryCount + 1} with:`, { data, userId });
      
      const userIdInt = validateUserId(userId, "storeDataOnBlockchain");
      
      // Ensure accounts funded on each attempt
      await ensureAccountsFunded();
      
      const contract = await getContractByUserId(userIdInt);
      const accounts = await getAccounts();
      const userAccount = accounts.find(acc => acc.userId === userIdInt);
      
      if (!userAccount) {
        throw new Error(`No account mapped for user ID ${userIdInt}. Available users: 1-${accounts.length}`);
      }
      
      // Check balance with more detailed logging
      const balance = await provider.getBalance(userAccount.address);
      console.log(`💰 User ${userIdInt} balance: ${ethers.formatEther(balance)} ETH`);
      
      if (balance === 0n) {
        if (retryCount < maxRetries) {
          console.log(`🔄 Account has 0 balance, retrying after funding... (attempt ${retryCount + 1})`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }
        throw new Error(`Account for User ${userIdInt} has 0 ETH balance after ${maxRetries} retries.`);
      }
      
      const dataHash = stringToBytes32(data);
      
      console.log(`💾 Storing data for User ${userIdInt}`);
      console.log(`🔑 Data hash: ${dataHash}`);
      console.log(`👤 Stored by: ${userAccount.address} (User ${userIdInt} → Account ${userAccount.index})`);
      
      console.log(`⏳ Storing data on blockchain...`);
      
      try {
        const gasEstimate = await contract.storeData.estimateGas(dataHash);
        console.log(`⛽ Estimated gas: ${gasEstimate}`);
        
        const tx = await contract.storeData(dataHash);
        console.log(`📝 Transaction sent: ${tx.hash}`);
        
        const receipt = await tx.wait();
        
        console.log(`✅ Data stored successfully. Transaction: ${receipt.hash}`);
        
        return {
          transactionHash: receipt.hash,
          data: data,
          dataHash: dataHash,
          owner: userAccount.address,
          storedBy: userAccount.address,
          userId: userIdInt,
          accountIndex: userAccount.index
        };
      } catch (txError) {
        if (txError.reason?.includes('already exists') || txError.reason?.includes('already stored')) {
          throw new Error(`Data already exists on blockchain. Hash: ${dataHash}`);
        }
        throw txError;
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        console.log(`🔄 Error encountered, retrying... (attempt ${retryCount + 1}):`, error.message);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error('❌ Error storing data on blockchain after retries:', error);
        throw error;
      }
    }
  }
}

// Grant consent using USER IDs - UPDATED WITH BETTER VALIDATION AND DEBUGGING
async function grantConsentOnBlockchain(data, requesterUserId, ownerUserId) {
  try {
    console.log(`🔧 grantConsentOnBlockchain called with:`, { data, requesterUserId, ownerUserId });
    
    // Debug the incoming values first
    debugUserIds(ownerUserId, requesterUserId, "grantConsentOnBlockchain");
    
    // Validate user IDs first with enhanced debugging
    const ownerIdInt = validateUserId(ownerUserId, "grantConsentOnBlockchain (owner)");
    const requesterIdInt = validateUserId(requesterUserId, "grantConsentOnBlockchain (requester)");
    
    if (ownerIdInt === requesterIdInt) {
      throw new Error(`Owner and requester cannot be the same user (User ${ownerIdInt})`);
    }
    
    // Ensure accounts are funded first
    await ensureAccountsFunded();
    
    const contract = await getContractByUserId(ownerIdInt);
    const accounts = await getAccounts();
    
    const ownerAccount = accounts.find(acc => acc.userId === ownerIdInt);
    const requesterAccount = accounts.find(acc => acc.userId === requesterIdInt);

    if (!ownerAccount) {
      throw new Error(`Owner account not found for user ID ${ownerIdInt}`);
    }
    if (!requesterAccount) {
      throw new Error(`Requester account not found for user ID ${requesterIdInt}`);
    }

    const dataHash = stringToBytes32(data);
    
    console.log(`🔑 Granting consent for data: "${data}"`);
    console.log(`🔑 Data hash: ${dataHash}`);
    console.log(`👤 Data Owner: ${ownerAccount.address} (User ${ownerIdInt})`);
    console.log(`👥 Granting to: ${requesterAccount.address} (User ${requesterIdInt})`);
    
    console.log(`⏳ Granting consent...`);
    
    const tx = await contract.grantConsent(dataHash, requesterAccount.address);
    console.log(`📝 Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    
    console.log(`✅ Consent transaction confirmed: ${receipt.hash}`);
    
    // Verify consent was granted
    try {
      const hasConsent = await contract.checkConsent(dataHash, requesterAccount.address);
      console.log(`✅ Consent verification: ${hasConsent}`);
      
      return {
        transactionHash: receipt.hash,
        data: data,
        dataHash: dataHash,
        owner: ownerAccount.address,
        grantedTo: requesterAccount.address,
        ownerUserId: ownerIdInt,
        requesterUserId: requesterIdInt,
        consentVerified: hasConsent
      };
    } catch (checkError) {
      console.log(`⚠️ Consent granted but verification failed:`, checkError.message);
      return {
        transactionHash: receipt.hash,
        data: data,
        dataHash: dataHash,
        owner: ownerAccount.address,
        grantedTo: requesterAccount.address,
        ownerUserId: ownerIdInt,
        requesterUserId: requesterIdInt,
        consentVerified: null
      };
    }
  } catch (error) {
    console.error('❌ Error granting consent on blockchain:', error);
    
    if (error.reason?.includes('Only owner can grant') || error.message?.includes('not the data owner')) {
      throw new Error(`Permission denied: Only the data owner can grant consent. User ${ownerUserId} may not be the data owner.`);
    }
    
    throw error;
  }
}

// Check consent using USER IDs - UPDATED WITH BETTER VALIDATION
async function checkConsent(data, requesterUserId, signerUserId = null) {
  try {
    console.log(`🔧 checkConsent called with:`, { data, requesterUserId, signerUserId });
    
    // Validate requester user ID
    const requesterIdInt = validateUserId(requesterUserId, "checkConsent (requester)");
    
    const accounts = await getAccounts();
    
    const requesterAccount = accounts.find(acc => acc.userId === requesterIdInt);
    if (!requesterAccount) {
      throw new Error(`Requester account not found for user ID ${requesterIdInt}`);
    }

    // Use the requester as signer if no specific signer provided
    const actualSignerUserId = signerUserId || requesterIdInt;
    const signerIdInt = validateUserId(actualSignerUserId, "checkConsent (signer)");
    
    const contract = await getContractByUserId(signerIdInt);
    const signerAccount = accounts.find(acc => acc.userId === signerIdInt);

    const dataHash = stringToBytes32(data);
    
    console.log(`🔍 Checking consent for data: "${data}"`);
    console.log(`🔑 Data hash: ${dataHash}`);
    console.log(`👥 Checking for: ${requesterAccount.address} (User ${requesterIdInt})`);
    console.log(`👤 Using signer: ${signerAccount.address} (User ${signerIdInt})`);
    
    try {
      const result = await contract.checkConsent(dataHash, requesterAccount.address);
      console.log(`✅ Consent check completed: ${result}`);
      
      return {
        hasConsent: result,
        data: data,
        dataHash: dataHash,
        requester: requesterAccount.address,
        requesterUserId: requesterIdInt,
        exists: true
      };
    } catch (error) {
      console.log(`⚠️ Consent check failed, assuming no consent:`, error.message);
      return {
        hasConsent: false,
        data: data,
        dataHash: dataHash,
        requester: requesterAccount.address,
        requesterUserId: requesterIdInt,
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

// Get account information with user mapping
async function getAccountInfo() {
  const accounts = await getAccounts();
  return {
    totalAccounts: accounts.length,
    accounts: accounts.map(account => ({
      index: account.index,
      address: account.address,
      privateKey: account.privateKey,
      userId: account.userId,
      isValid: ethers.isAddress(account.address)
    }))
  };
}

// Get account by user ID - UPDATED WITH VALIDATION
async function getAccountByUserId(userId) {
  const accounts = await getAccounts();
  const userIdInt = validateUserId(userId, "getAccountByUserId");
  
  const account = accounts.find(acc => acc.userId === userIdInt);
  
  if (!account) {
    throw new Error(`No account found for user ID ${userId}`);
  }
  
  return account;
}

// Quick function to store existing hash using user ID - UPDATED WITH VALIDATION
async function storeExistingHash(hash, userId) {
  try {
    if (!hash.startsWith('0x') || hash.length !== 66) {
      throw new Error('Invalid hash format. Should be 0x followed by 64 hex characters');
    }
    
    const userIdInt = validateUserId(userId, "storeExistingHash");
    
    console.log(`💾 Storing existing hash for User ${userIdInt}: ${hash}`);
    
    // Ensure accounts are funded first
    await ensureAccountsFunded();
    
    const contract = await getContractByUserId(userIdInt);
    const account = await getAccountByUserId(userIdInt);
    
    console.log(`⏳ Storing hash on blockchain...`);
    
    const tx = await contract.storeData(hash);
    console.log(`📝 Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    
    console.log(`✅ Hash stored successfully`);
    
    return {
      transactionHash: receipt.hash,
      data: hash,
      dataHash: hash,
      owner: account.address,
      storedBy: account.address,
      userId: userIdInt
    };
  } catch (error) {
    console.error('❌ Error storing existing hash:', error);
    throw error;
  }
}

// Utility function to check deployment status
async function getDeploymentStatus() {
  return await verifyContractDeployment();
}

// Manual funding function for external use
async function manuallyFundAccounts() {
  console.log('🔄 Manual account funding requested...');
  return await fundAccountsBatch();
}

// Get available user IDs for debugging
function getAvailableUserIds() {
  if (!cachedAccounts) {
    return { error: "Accounts not initialized yet" };
  }
  return cachedAccounts.map(acc => acc.userId);
}

// Validate and normalize user ID from various inputs
function normalizeUserId(userId) {
  if (userId === undefined || userId === null) {
    throw new Error("User ID is required");
  }
  
  // Convert to number - handle various input types
  let normalized;
  if (typeof userId === 'string') {
    normalized = parseInt(userId.trim());
  } else if (typeof userId === 'number') {
    normalized = userId;
  } else {
    throw new Error(`Invalid user ID type: ${typeof userId}. Must be string or number.`);
  }
  
  if (isNaN(normalized)) {
    throw new Error(`Invalid user ID: "${userId}" cannot be converted to a number`);
  }
  
  return validateUserId(normalized, "normalizeUserId");
}

// Improved startup verification with better error handling
async function initializeBlockchainConnection() {
  try {
    console.log('🚀 Initializing blockchain connection...');
    
    // First check network readiness
    await checkNetworkReadiness();
    
    // Then check contract deployment
    const isDeployed = await verifyContractDeployment();
    if (!isDeployed) {
      throw new Error('Contract not deployed');
    }
    
    // Ensure accounts are funded (with retry logic)
    let fundingSuccess = false;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries && !fundingSuccess) {
      try {
        await ensureAccountsFunded();
        fundingSuccess = true;
      } catch (fundingError) {
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`🔄 Funding failed, retry ${retryCount}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('⚠️ Continuing with partially funded accounts - some operations may fail');
          // Don't throw error, continue with partial funding
          fundingSuccess = true; // Continue anyway
        }
      }
    }
    
    console.log('✅ Blockchain connection initialized');
    return true;
  } catch (error) {
    console.error('❌ Blockchain initialization failed:', error);
    return false;
  }
}

// Replace your current startup verification
initializeBlockchainConnection().then(success => {
  if (success) {
    console.log('✅ Server ready for blockchain operations');
  } else {
    console.log('❌ Server started with blockchain issues - some functions may not work');
  }
});

// Export all functions at the end to avoid duplicate exports
export {
  // Main blockchain functions
  storeDataOnBlockchain,
  grantConsentOnBlockchain,
  checkConsent,
  
  // Account management
  getAccountInfo,
  getAccountByUserId,
  checkAccountBalances,
  manuallyFundAccounts,
  
  // Contract and signer access
  getContract,
  getContractByUserId,
  getSigner,
  getSignerByUserId,
  
  // Utility functions
  getDeploymentStatus,
  storeExistingHash,
  getAvailableUserIds,
  validateUserId,
  normalizeUserId,
  debugUserIds,
  
  // Initialization
  initializeBlockchainConnection
};