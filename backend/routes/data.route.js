import express from "express";
import {
  storeData,
  getData,
  grantConsent,
  requestConsent,
  getPendingRequests,
  declineConsent
} from "../controller/data.controller.js";

const router = express.Router();

// Store data
router.post("/storedata", storeData);

// Get specific data (with consent check)
router.get("/getdata/:dataHash", getData);

// Request consent to access someone's data
router.post("/request-consent", requestConsent);

// Grant consent (approve a request)
router.post("/grant-consent", grantConsent);

router.post('/decline-consent', declineConsent);

// Get pending consent requests for a data owner
router.get("/pending-requests/:ownerId", getPendingRequests);


export default router;