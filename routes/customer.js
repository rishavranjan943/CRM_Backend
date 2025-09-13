import express from "express";
import Customer from "../models/customer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const query = { owner_user_id: req.user.userId }; 
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query).skip(skip).limit(limit),
      Customer.countDocuments(query)
    ]);

    res.json({
      ok: true,
      data: customers,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.email || !data.phone) {
      return res.status(400).json({ ok: false, error: "name, email, phone are required" });
    }

    console.log(data)

    const existing = await Customer.findOne({
      owner_user_id: req.user.userId,
      $or: [{ email: data.email }, { phone: data.phone }]
    });
    if (existing) {
      return res.status(400).json({
        ok: false,
        error: "Customer already exists with same email or phone"
      });
    }

    const count = await Customer.countDocuments({ owner_user_id: req.user.userId });
    data.customer_id = `CUST${String(count + 1).padStart(3, "0")}`;
    data.owner_user_id = req.user.userId;

    const c = new Customer(data);
    await c.save();

    return res.status(201).json({ ok: true, customer: c });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
