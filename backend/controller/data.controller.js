import pool from "../db.js";
import crypto from "crypto";
import {
  storeDataOnBlockchain,
  checkConsent,
  grantConsentOnBlockchain,
  getAccountInfo
} from "../blockchain.js";

// generate hash for data
function generateHash(data) {
  return "0x" + crypto.createHash("sha256").update(data).digest("hex");
}

// Store data + metadata
export const storeData = async (req, res) => {
  try {
    const { userId, data } = req.body;
    
    if (!userId || !data) {
      return res.status(400).json({ error: "userId and data are required" });
    }

    const hash = generateHash(data);
    const accountIndex = parseInt(userId) - 1;
    
    console.log(`💾 Storing data for user ${userId} using account index ${accountIndex}`);

    const blockchainResult = await storeDataOnBlockchain(data, accountIndex);

    // Store in database - without id column (auto-increment removed)
    await pool.query(
      "INSERT INTO records (user_id, data_hash, data_value, blockchain_txn, blockchain_owner) VALUES ($1, $2, $3, $4, $5)",
      [userId, hash, data, blockchainResult.transactionHash, blockchainResult.owner]
    );

    res.json({ 
      message: "Data stored successfully", 
      txnHash: blockchainResult.transactionHash,
      dataHash: hash,
      owner: blockchainResult.owner,
      userAccount: `Account ${accountIndex}`
    });
  } catch (err) {
    console.error(err);
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

// GRANT CONSENT - Data owner approves a request
export const grantConsent = async (req, res) => {
  try {
    const { ownerId, requestId } = req.body;

    console.log(`🔧 Granting consent for request: ${requestId} by owner: ${ownerId}`);

    if (!ownerId || !requestId) {
      return res.status(400).json({ 
        error: "ownerId and requestId are required"
      });
    }

    // 1. Get the consent request
    const requestResult = await pool.query(
      "SELECT * FROM consent_requests WHERE id=$1 AND owner_id=$2 AND status='pending'",
      [requestId, ownerId]
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
      [ownerId, consentRequest.data_hash]
    );

    if (recordResult.rowCount === 0) {
      return res.status(404).json({ 
        message: "Data not found"
      });
    }

    const record = recordResult.rows[0];

    console.log(`✅ Processing consent request from User ${consentRequest.requester_id}`);

    // 3. Use direct account mapping
    const ownerAccountIndex = parseInt(ownerId) - 1;
    const accounts = await getAccountInfo();
    const ownerAddress = accounts.accounts[ownerAccountIndex].address;
    const requesterAddress = accounts.accounts[parseInt(consentRequest.requester_id) - 1].address;

    console.log(`👥 Granting access:`);
    console.log(`   Owner: ${ownerAddress} (User ${ownerId})`);
    console.log(`   Requester: ${requesterAddress} (User ${consentRequest.requester_id})`);

    // 4. Grant consent on blockchain
    const blockchainResult = await grantConsentOnBlockchain(
      record.data_value, 
      requesterAddress, 
      ownerAccountIndex
    );

    // 5. Update consent request status
    await pool.query(
      "UPDATE consent_requests SET status='approved', granted_at=$1 WHERE id=$2",
      [new Date(), requestId]
    );

    console.log(`✅ Consent granted: ${blockchainResult.transactionHash}`);

    res.json({ 
      success: true,
      message: "Consent granted successfully", 
      requestId: requestId,
      dataOwner: ownerId,
      grantedTo: consentRequest.requester_id,
      txnHash: blockchainResult.transactionHash,
      consentVerified: blockchainResult.consentVerified
    });
  } catch (err) {
    console.error('❌ Error in grantConsent:', err);
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

    res.json({
      success: true,
      pendingRequests: result.rows,
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
      data: record.data_value,
      dataOwner: record.user_id,
      consentVerified: true,
      dataHash: record.data_hash
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};