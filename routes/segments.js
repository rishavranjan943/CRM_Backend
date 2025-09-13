import express from "express";
import Segment from "../models/segment.js";
import Customer from "../models/customer.js";
import { buildMongoQuery } from "../utils/rule.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    const query = {
      owner_user_id: req.user.userId
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [segments, total] = await Promise.all([
      Segment.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Segment.countDocuments(query)
    ]);

    const withCounts = await Promise.all(
      segments.map(async (s) => {
        const q = buildMongoQuery(s.rules);
        const count = await Customer.countDocuments(q);
        return { ...s, match_count: count };
      })
    );

    return res.json({ ok: true, segments: withCounts, total });
  } catch (err) {
    console.error("Segment fetch error:", err.message);
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
    mongoQuery.owner_user_id = req.user.userId;

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

    mongoQuery.owner_user_id = req.user.userId;

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
