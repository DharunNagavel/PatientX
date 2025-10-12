import pool from "../db.js";
import crypto from "crypto";
import {storeDataOnBlockchain,checkConsent,grantConsentOnBlockchain,} from "../blockchain.js";

// generate hash for data
function generateHash(data) {
  return "0x" + crypto.createHash("sha256").update(data).digest("hex");
}

// Store data + metadata
export const storeData = async (req, res) => {
  try {
    const { userId, data } = req.body;
    const hash = generateHash(data);

    const txnHash = await storeDataOnBlockchain(userId, hash);

    await pool.query(
      "INSERT INTO records (user_id, data_hash, data_value, blockchain_txn) VALUES ($1, $2, $3, $4)",
      [userId, hash, data, txnHash]
    );

    res.json({ message: "Data stored successfully", txnHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Retrieve data with consent verification
export const getData = async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterId } = req.query;

    const result = await pool.query("SELECT * FROM records WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data not found" });

    const record = result.rows[0];

    const isAllowed = await checkConsent(record.data_hash, requesterId);

    if (!isAllowed)
      return res.status(403).json({ message: "Access denied — consent not granted" });

    res.json({ data: record.data_value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Grant consent to a requester
export const grantConsent = async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterId } = req.body;

    const result = await pool.query("SELECT * FROM records WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Data not found" });

    const record = result.rows[0];
    const txnHash = await grantConsentOnBlockchain(record.data_hash, requesterId);

    res.json({ message: "Consent granted successfully", txnHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
