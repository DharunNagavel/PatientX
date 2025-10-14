import express from "express";
import {
  storeData,
  getData,
  grantConsent,
  requestConsent,
  getPendingRequests,
  declineConsent,
  getUserRecords,
  getResearcherRequests,
  cancelConsentRequest,
  withdrawAccess
} from "../controller/data.controller.js";

const router = express.Router();

// Store data
router.post("/storedata", storeData);

// Get specific data (with consent check)
router.get("/getdata/:dataHash", getData);

// Request consent to access someone's data
router.post("/request-consent", requestConsent);

// Get user records
router.get("/user/:user_id", getUserRecords);

// Grant consent (approve a request)
router.post("/grant-consent", grantConsent);

// Decline consent
router.post('/decline-consent', declineConsent);

// Get pending consent requests for a data owner
router.get("/pending-requests/:ownerId", getPendingRequests);

// Get consent requests for researcher
router.get("/researcher-requests/:researcherId", getResearcherRequests);

// Cancel consent request
router.post("/cancel-request", cancelConsentRequest);

// Withdraw access
router.post("/withdraw-access", withdrawAccess);

export default router;