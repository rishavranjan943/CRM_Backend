import express from "express";
import Segment from "../models/segment.js";
import Customer from "../models/customer.js";
import { buildMongoQuery } from "../utils/rule.js";

const router = express.Router();



router.get("/", async (req, res) => {
  try {
    const segments = await Segment.find({ owner_user_id: req.user.userId }).lean();

    const withCounts = await Promise.all(
      segments.map(async (s) => {
        const q = buildMongoQuery(s.rules);
        const count = await Customer.countDocuments(q);
        return { ...s, match_count: count };
      })
    );

    return res.json({ ok: true, segments: withCounts });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});



router.get("/:id/customers", async (req, res) => {
  try {
    const seg = await Segment.findOne({ _id: req.params.id, owner_user_id: req.user.userId }).lean();
    if (!seg) return res.status(404).json({ ok: false, error: "Segment not found" });

    const q = buildMongoQuery(seg.rules);
    const customers = await Customer.find(q).lean();

    return res.json({ ok: true, customers });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});




router.post("/", async (req, res) => {
  try {
    const { name, rules } = req.body;

    if (!name || !rules) {
      return res.status(400).json({ ok: false, error: "name and rules required" });
    }

    const mongoQuery = buildMongoQuery(rules);

    const count = await Customer.countDocuments(mongoQuery);

    const seg = await Segment.create({
      name,
      owner_user_id: req.user.userId,
      rules,
      last_preview_count: count
    });

    return res.status(201).json({ ok: true, segment: seg });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});


router.post("/preview", async (req, res) => {
  try {
    const { rules } = req.body;
    if (!rules || !rules.children) {
      return res.status(400).json({ ok: false, error: "rules (with children) required" });
    }

    const mongoQuery = buildMongoQuery(rules);

    const customers = await Customer.find(mongoQuery).limit(10).lean();
    const count = await Customer.countDocuments(mongoQuery);

    return res.json({ ok: true, count, customers });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});




router.delete("/:id", async (req, res) => {
  try {
    await Segment.findOneAndDelete({ _id: req.params.id, owner_user_id: req.user.userId });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});


export default router;
