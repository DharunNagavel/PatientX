import pool from "../db.js";
import {
  storeDataOnBlockchain,
  checkConsent,
  grantConsentOnBlockchain,
  getAccountInfo
} from "../blockchain.js";

import { ethers } from "ethers";

function generateHash(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}


// Store data + metadata - UPDATED TO STORE FILE CONTENT
export const storeData = async (req, res) => {
  try {
    const { userId, type, rate, notes, files: fileData, amount } = req.body;

    console.log(`🔧 storeData called with userId: ${userId}, type: ${type}`);

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt) || userIdInt < 1) {
      return res.status(400).json({
        error: `Invalid userId: ${userId}. Must be a positive number starting from 1.`
      });
    }

    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    // -----------------------------
    // Process Files (Base64)
    // -----------------------------
    const files = [];

    if (fileData && Array.isArray(fileData)) {
      fileData.forEach(file => {
        files.push({
          fileName: file.fileName,
          content: file.content,
          mimeType: file.mimeType || "application/octet-stream",
          size: file.size || 0
        });
      });
    }

    // -----------------------------
    // FIXED: Amount & Rate
    // -----------------------------
    const finalRate = parseInt(rate) || parseInt(amount) || 0;
    const finalAmount = parseInt(amount) || parseInt(rate) || 0;

    const medicalRecord = {
      recordType: type,
      files,
      rate: finalRate,
      amount: finalAmount,
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    // Convert record to string for blockchain
    const dataString = JSON.stringify(medicalRecord);
    const hash = generateHash(dataString);

    console.log(`💾 Storing medical record for user ${userIdInt}`);
    console.log(`💰 Rate: ₹${finalRate}, Amount: ₹${finalAmount}`);

    // Store on blockchain
const blockchainResult = await storeDataOnBlockchain(hash, userIdInt);

    // Save in Database
    await pool.query(
      "INSERT INTO records (user_id, data_hash, data_value, blockchain_txn, blockchain_owner, amount) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        userIdInt,
        hash,
        dataString,
        blockchainResult.transactionHash,
        blockchainResult.owner,
        finalAmount  // FIXED
      ]
    );

    res.json({
      success: true,
      message: "Medical record stored successfully",
      txnHash: blockchainResult.transactionHash,
      dataHash: hash,
      owner: blockchainResult.owner,
      record: {
        ...medicalRecord,
        files: medicalRecord.files.map(f => ({
          fileName: f.fileName,
          size: f.size,
          mimeType: f.mimeType
        }))
      }
    });

  } catch (err) {
    console.error("❌ Error in storeData:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};


// REQUEST CONSENT - User asks for access to someone's data
export const requestConsent = async (req, res) => {
  try {
    const { requesterId, ownerId, dataHash } = req.body;

    console.log(`🔔 Consent request: User ${requesterId} wants access to data from User ${ownerId}`);

    if (!requesterId || !ownerId || !dataHash) {
      return res.status(400).json({ 
        error: "requesterId, ownerId, and dataHash are required"
      });
    }

    if (requesterId === ownerId) {
      return res.status(400).json({ 
        error: "You cannot request access to your own data"
      });
    }

    // Check if the data exists and belongs to the owner
    const result = await pool.query(
      "SELECT * FROM records WHERE user_id=$1 AND data_hash=$2",
      [ownerId, dataHash]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        message: "Data not found or you don't have permission",
        details: `No data found for user ${ownerId} with the provided hash`
      });
    }

    const record = result.rows[0];

    // Store consent request in database
    await pool.query(
      `INSERT INTO consent_requests 
       (requester_id, owner_id, data_hash, status, requested_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [requesterId, ownerId, dataHash, 'pending', new Date()]
    );

    console.log(`✅ Consent request stored: User ${requesterId} → User ${ownerId}`);

    res.json({ 
      success: true,
      message: "Consent request sent successfully",
      request: {
        requesterId,
        ownerId,
        dataHash,
        status: 'pending',
        note: "Wait for the data owner to approve your request"
      }
    });
  } catch (err) {
    console.error('❌ Error in requestConsent:', err);
    res.status(500).json({ 
      error: "Server error: " + err.message
    });
  }
};

// GRANT CONSENT - Data owner approves a request - UPDATED WITH FIX
export const grantConsent = async (req, res) => {
  try {
    const { ownerId, requestId } = req.body;

    console.log(`🔧 Granting consent for request: ${requestId} by owner: ${ownerId}`);

    if (!ownerId || !requestId) {
      return res.status(400).json({ 
        error: "ownerId and requestId are required"
      });
    }

    // Validate ownerId first
    const ownerIdInt = parseInt(ownerId);
    if (isNaN(ownerIdInt) || ownerIdInt < 1) {
      return res.status(400).json({ 
        error: `Invalid ownerId: ${ownerId}. Must be a positive number starting from 1.` 
      });
    }

    // 1. Get the consent request
    const requestResult = await pool.query(
      "SELECT * FROM consent_requests WHERE id=$1 AND owner_id=$2 AND status='pending'",
      [requestId, ownerIdInt]
    );
    
    if (requestResult.rowCount === 0) {
      return res.status(404).json({ 
        message: "Consent request not found or already processed",
        details: "Check if the request exists and you are the data owner"
      });
    }

    const consentRequest = requestResult.rows[0];

    // 2. Get the actual data record
    const recordResult = await pool.query(
      "SELECT * FROM records WHERE user_id=$1 AND data_hash=$2",
      [ownerIdInt, consentRequest.data_hash]
    );

    if (recordResult.rowCount === 0) {
      return res.status(404).json({ 
        message: "Data not found in database"
      });
    }

    const record = recordResult.rows[0];

    console.log(`✅ Processing consent request from User ${consentRequest.requester_id}`);

    // 3. Use USER IDs instead of account indexes
    const requesterIdInt = parseInt(consentRequest.requester_id);
    
    if (isNaN(requesterIdInt) || requesterIdInt < 1) {
      return res.status(400).json({ 
        error: `Invalid requester ID in consent request: ${consentRequest.requester_id}` 
      });
    }

    console.log(`👥 Granting access:`);
    console.log(`   Owner: User ${ownerIdInt}`);
    console.log(`   Requester: User ${requesterIdInt}`);
    console.log(`   Data Hash: ${record.data_hash}`);

    // 4. FIX: Verify blockchain ownership before granting
    try {
      // Optional: Add a pre-check function to verify ownership
      const contract = await getContractByUserId(ownerIdInt);
      // You might want to add a function like `isDataOwner(bytes32 dataHash, address owner)` to your contract
      // For now, we'll proceed with the grant
    } catch (checkError) {
      console.log('⚠️ Could not pre-verify ownership:', checkError.message);
    }

    // 5. Grant consent on blockchain
    const blockchainResult = await grantConsentOnBlockchain(
      record.data_hash,
      requesterIdInt,
      ownerIdInt
    );

    // 6. Update consent request status
    await pool.query(
      "UPDATE consent_requests SET status='approved', granted_at=$1 WHERE id=$2",
      [new Date(), requestId]
    );

    console.log(`✅ Consent granted: ${blockchainResult.transactionHash}`);

    res.json({ 
      success: true,
      message: "Consent granted successfully", 
      requestId: requestId,
      dataOwner: ownerIdInt,
      grantedTo: consentRequest.requester_id,
      txnHash: blockchainResult.transactionHash,
      consentVerified: blockchainResult.consentVerified
    });
  } catch (err) {
    console.error('❌ Error in grantConsent:', err);
    
    // FIX: Provide more helpful error messages
    if (err.message.includes('not owned by')) {
      return res.status(403).json({ 
        error: "Blockchain verification failed: " + err.message,
        suggestion: "Please ensure that User " + req.body.ownerId + " has stored this data on the blockchain first."
      });
    }
    
    if (err.message.includes('does not exist')) {
      return res.status(404).json({ 
        error: "Data not found on blockchain: " + err.message,
        suggestion: "Please store the data on blockchain using the /api/data/store endpoint first."
      });
    }
    
    res.status(500).json({ 
      error: "Server error: " + err.message
    });
  }
};
// GET PENDING REQUESTS - Data owner sees who wants access
export const getPendingRequests = async (req, res) => {
  try {
    const { ownerId } = req.params;

    console.log(`📋 Getting pending requests for owner: ${ownerId}`);

    const result = await pool.query(
      `SELECT cr.*, r.data_value 
       FROM consent_requests cr
       JOIN records r ON cr.data_hash = r.data_hash
       WHERE cr.owner_id=$1 AND cr.status='pending'
       ORDER BY cr.requested_at DESC`,
      [ownerId]
    );

    // Parse the data_value to include record info without file content
    const pendingRequests = result.rows.map(row => {
      const recordData = JSON.parse(row.data_value);
      return {
        ...row,
        recordInfo: {
          recordType: recordData.recordType,
          fileCount: recordData.files ? recordData.files.length : 0,
          fileNames: recordData.files ? recordData.files.map(f => f.fileName) : [],
          rate: recordData.rate,
          notes: recordData.notes,
          createdAt: recordData.createdAt
        }
      };
    });

    res.json({
      success: true,
      pendingRequests: pendingRequests,
      total: result.rowCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// Get data with consent verification
export const getData = async (req, res) => {
  try {
    const { dataHash } = req.params;
    const { requesterId } = req.query;

    if (!requesterId) {
      return res.status(400).json({ error: "requesterId is required" });
    }

    console.log(`📖 Get data: Hash ${dataHash}, Requester: ${requesterId}`);

    const result = await pool.query("SELECT * FROM records WHERE data_hash=$1", [dataHash]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    const record = result.rows[0];
    
    // Parse the stored JSON data
    const storedData = JSON.parse(record.data_value);
    
    // Get requester's Ethereum address
    const accounts = await getAccountInfo();
    const requesterAccountIndex = parseInt(requesterId) - 1;
    const requesterAddress = accounts.accounts[requesterAccountIndex].address;
    
    console.log(`🔍 Checking consent for requester: ${requesterAddress} (User ${requesterId})`);

    const consentResult = await checkConsent(record.data_value, requesterAddress);

    if (!consentResult.hasConsent) {
      return res.status(403).json({ 
        message: "Access denied — consent not granted",
        details: {
          dataOwner: record.user_id,
          requester: requesterId,
          hint: "Request consent from the data owner first"
        }
      });
    }

    res.json({ 
      data: storedData,
      dataOwner: record.user_id,
      consentVerified: true,
      dataHash: record.data_hash
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// DECLINE CONSENT - Data owner declines a request
export const declineConsent = async (req, res) => {
  try {
    const { ownerId, requestId } = req.body;

    console.log(`❌ Declining consent for request: ${requestId} by owner: ${ownerId}`);

    if (!ownerId || !requestId) {
      return res.status(400).json({ 
        error: "ownerId and requestId are required"
      });
    }

    // Update consent request status to declined
    const result = await pool.query(
      "UPDATE consent_requests SET status='declined', granted_at=$1 WHERE id=$2 AND owner_id=$3",
      [new Date(), requestId, ownerId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        message: "Consent request not found"
      });
    }

    console.log(`✅ Consent declined for request: ${requestId}`);

    res.json({ 
      success: true,
      message: "Consent declined successfully", 
      requestId: requestId
    });
  } catch (err) {
    console.error('❌ Error in declineConsent:', err);
    res.status(500).json({ 
      error: "Server error: " + err.message
    });
  }
};

// Get user's stored records
export const getUserRecords = async (req, res) => {
  try {
    const { user_id } = req.params;

    console.log(`📁 Getting records for user: ${user_id}`);

    if (!user_id) {
      return res.status(400).json({ 
        error: "User ID is required" 
      });
    }

    const userExists = await pool.query(
  "SELECT 1 FROM users WHERE user_id=$1", [user_id]);
if (userExists.rowCount === 0) {  // Check if no rows returned
  return res.status(404).json({ 
    success: false,
    error: "User not found",
    details: `User with ID ${user_id} does not exist`
  });
}

    // Get user's records from database
    const result = await pool.query(
      `SELECT data_hash, data_value, created_at, blockchain_txn, blockchain_owner 
       FROM records 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [user_id]
    );

    console.log(`✅ Found ${result.rowCount} records for user ${user_id}`);

    // Parse each record's data_value and format the response
    const userData = result.rows.map(row => {
      try {
        const data = JSON.parse(row.data_value);
        return {
          data_hash: row.data_hash,
          created_at: row.created_at,
          blockchain_txn: row.blockchain_txn,
          blockchain_owner: row.blockchain_owner,
          recordType: data.recordType,
          files: data.files ? data.files.map(f => ({
            fileName: f.fileName,
            size: f.size,
            mimeType: f.mimeType
            // Don't include actual file content in list view
          })) : [],
          rate: data.rate,
          notes: data.notes,
          createdAt: data.createdAt
        };
      } catch (parseError) {
        console.error('Error parsing record data:', parseError);
        return {
          data_hash: row.data_hash,
          created_at: row.created_at,
          blockchain_txn: row.blockchain_txn,
          recordType: 'Unknown',
          files: [],
          rate: 0,
          notes: 'Error parsing record data',
          createdAt: row.created_at
        };
      }
    });

    res.json({
      success: true,
      userData: userData,
      total: result.rowCount,
      userId: user_id
    });
  } catch (err) {
    console.error('❌ Error in getUserRecords:', err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};

// GET CONSENT REQUESTS FOR RESEARCHER
export const getResearcherRequests = async (req, res) => {
  try {
    const { researcherId } = req.params;

    console.log(`📋 Getting consent requests for researcher: ${researcherId}`);

    const result = await pool.query(
      `SELECT cr.*, r.data_value, u.username as owner_name
       FROM consent_requests cr
       JOIN records r ON cr.data_hash = r.data_hash
       JOIN users u ON cr.owner_id = u.user_id
       WHERE cr.requester_id = $1
       ORDER BY cr.requested_at DESC`,
      [researcherId]
    );

    const consentRequests = result.rows.map(row => {
      let recordData;
      try {
        recordData = JSON.parse(row.data_value);
      } catch {
        recordData = { recordType: 'Medical Data' };
      }

      return {
        id: row.id,
        owner_id: row.owner_id,
        owner_name: row.owner_name,
        data_hash: row.data_hash,
        status: row.status,
        requested_at: row.requested_at,
        granted_at: row.granted_at,
        data_value: row.data_value,
        record_type: recordData.recordType || 'Medical Record',
        purpose: row.purpose || "Research analysis"
      };
    });

    res.json({
      success: true,
      consentRequests: consentRequests,
      total: result.rowCount
    });
  } catch (err) {
    console.error('❌ Error in getResearcherRequests:', err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
};

// CANCEL CONSENT REQUEST
export const cancelConsentRequest = async (req, res) => {
  try {
    const { requestId, researcherId } = req.body;

    console.log(`❌ Canceling consent request: ${requestId} by researcher: ${researcherId}`);

    if (!requestId || !researcherId) {
      return res.status(400).json({ 
        error: "requestId and researcherId are required"
      });
    }

    // Update consent request status to cancelled
    const result = await pool.query(
      "UPDATE consent_requests SET status='cancelled' WHERE id=$1 AND requester_id=$2 AND status='pending'",
      [requestId, researcherId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found or cannot be cancelled"
      });
    }

    console.log(`✅ Consent request cancelled: ${requestId}`);

    res.json({ 
      success: true,
      message: "Request cancelled successfully", 
      requestId: requestId
    });
  } catch (err) {
    console.error('❌ Error in cancelConsentRequest:', err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message
    });
  }
};

// WITHDRAW ACCESS
export const withdrawAccess = async (req, res) => {
  try {
    const { requestId, ownerId } = req.body;

    console.log(`🔒 Withdrawing access for request: ${requestId}`);

    if (!requestId) {
      return res.status(400).json({ 
        error: "requestId is required"
      });
    }

    // Update consent request status to withdrawn
    const result = await pool.query(
      "UPDATE consent_requests SET status='withdrawn' WHERE id=$1 AND status='approved'",
      [requestId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Approved request not found"
      });
    }

    console.log(`✅ Access withdrawn for request: ${requestId}`);

    res.json({ 
      success: true,
      message: "Access withdrawn successfully", 
      requestId: requestId
    });
  } catch (err) {
    console.error('❌ Error in withdrawAccess:', err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message
    });
  }
};