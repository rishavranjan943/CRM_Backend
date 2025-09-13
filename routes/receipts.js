import express from "express";
import { enqueueReceipt } from "../utils/receiptConsumer.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const { vendor_message_id, status, delivered_at, failure_reason, campaign_id } = req.body;

    if (!vendor_message_id || !status) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    enqueueReceipt({ vendor_message_id, status, delivered_at, failure_reason, campaign_id });
    return res.json({ ok: true, queued: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});


export default router;
