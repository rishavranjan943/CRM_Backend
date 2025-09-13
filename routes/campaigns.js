import express from "express";
import Campaign from "../models/campaign.js";
import Segment from "../models/segment.js";
import Customer from "../models/customer.js";
import CommunicationLog from "../models/communicationLog.js";
import { buildMongoQuery } from "../utils/rule.js";
import { personalizeMessage } from "../utils/personalize.js";
import axios from "axios";

const router = express.Router();



router.get("/:id/logs", async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ campaign_id: req.params.id }).lean();
    return res.json({ ok: true, logs });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, segment_id, message_template } = req.body;
    if (!name || !segment_id || !message_template) {
      return res.status(400).json({ ok: false, error: "name, segment_id, and message_template required" });
    }

    const segment = await Segment.findById(segment_id);
    if (!segment) return res.status(404).json({ ok: false, error: "Segment not found" });

    const mongoQuery = buildMongoQuery(segment.rules);
    const customers = await Customer.find(mongoQuery).lean();

    const campaign = await Campaign.create({
      name,
      owner_user_id: req.user.userId,
      segment_id,
      message_template,
      audience_size: customers.length,
      status: "running"
    });

    for (let cust of customers) {
      const personalized = personalizeMessage(message_template, cust);

      const log = await CommunicationLog.create({
        campaign_id: campaign._id,
        customer_id: cust.customer_id,
        message: personalized,
        status: "PENDING"
      });


      axios.post(`${process.env.BASE_URL}/api/vendor/send`, {
        campaign_id: campaign._id,
        customer_id: cust.customer_id,
        log_id: log._id,
        message: personalized
      }).catch(err => console.error("Vendor send error:", err.message));
    }

    return res.status(201).json({ ok: true, campaign });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ owner_user_id: req.user.userId })
      .sort({ created_at: -1 })
      .lean();

    const history = [];
    for (let camp of campaigns) {
      const total = await CommunicationLog.countDocuments({ campaign_id: camp._id });
      const sent = await CommunicationLog.countDocuments({ campaign_id: camp._id, status: "SENT" });
      const failed = await CommunicationLog.countDocuments({ campaign_id: camp._id, status: "FAILED" });
      const pending = total - sent - failed;

      history.push({ ...camp, stats: { total, sent, failed, pending } });
    }

    return res.json({ ok: true, history });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});




export default router;
