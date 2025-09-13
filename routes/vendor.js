import express from "express";
import CommunicationLog from "../models/communicationLog.js";
import axios from "axios";

const router = express.Router();


router.post("/send", async (req, res) => {
  try {
    const { campaign_id, customer_id, log_id, message } = req.body;
    if (!campaign_id || !customer_id || !log_id) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const vendor_message_id = "vm_" + log_id;

    await CommunicationLog.findByIdAndUpdate(log_id, { vendor_message_id });

    res.json({ ok: true, vendor_message_id });


    setTimeout(async () => {
      const success = Math.random() < 0.9; 
      const status = success ? "SENT" : "FAILED";

      try {
        await axios.post(`${process.env.BASE_URL}/api/receipts`, {
          vendor_message_id,
          campaign_id,
          customer_id,
          status,
          delivered_at: new Date().toISOString(),
          failure_reason: success ? null : "Network issue"
        });
      } catch (err) {
        console.error("Receipt post failed:", err.message);
      }
    }, 2000);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
