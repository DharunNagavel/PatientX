import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../db.js";
import { RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET } from "../config/env.js";

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

export const createOrder = async (req, res) => {
  try {
    const { ownerId, requesterId, dataHash } = req.body;

    console.log("Incoming order request:", req.body);

    // 1️⃣ Fetch the correct rate from DB
    const record = await pool.query(
      "SELECT amount FROM records WHERE data_hash = $1",
      [dataHash]
    );

    if (record.rowCount === 0) {
      return res.status(404).json({ error: "Record not found for this dataHash" });
    }

    const dbAmount = parseInt(record.rows[0].amount);

    if (!dbAmount || dbAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount in database" });
    }

    // 2️⃣ Create order with DB amount (NOT from frontend)
    const options = {
      amount: dbAmount * 100, // rupees → paisa
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      ownerId,
      requesterId,
      dataHash,
      amount: dbAmount
    });

  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            ownerId,
            requesterId,
            dataHash
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (expectedSign === razorpay_signature) {
            console.log("Payment Verified!");
        }
        res.status(400).json({
            success: false,
            message: "Invalid signature!"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
