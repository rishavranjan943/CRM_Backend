import express from "express";
import Order from "../models/order.js";
import Customer from "../models/customer.js";

const router = express.Router();





router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 }).limit(200).lean();
    return res.json({ ok: true, orders });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const data = req.body;
    if (!data.customer_id || !data.amount) {
           return res.status(400).json({ ok: false, error: "customer_id and amount are required" });
         }
    const count = await Order.countDocuments();
    data.order_id = `ORD${String(count + 1).padStart(3, "0")}`;

    const order = new Order(data);
    await order.save();

    await Customer.findOneAndUpdate(
      { customer_id: data.customer_id },
      {
        $inc: { total_spend: data.amount || 0, visits: 1 },
        $set: { last_order_at: data.created_at ? new Date(data.created_at) : new Date() }
      }
    );

    return res.status(201).json({ ok: true, order });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
