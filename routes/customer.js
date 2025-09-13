import express from "express";
import Customer from "../models/customer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q || "";
    const filter = q
      ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
      : {};
    const customers = await Customer.find(filter).limit(200).lean();
    return res.json({ ok: true, customers });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const count = await Customer.countDocuments();
    const newId = `CUST${String(count + 1).padStart(3, "0")}`;
    data.customer_id = newId;

    const c = new Customer(data);
    await c.save();

    return res.status(201).json({ ok: true, customer: c });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ ok: false, error: err.message });
  }
});



export default router;
