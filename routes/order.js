import express from "express";
import Order from "../models/order.js";
import Customer from "../models/customer.js";

const router = express.Router();





router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      const matchedCustomers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { customer_id: { $regex: search, $options: "i" } }
        ]
      }).select("customer_id");

      const matchedIds = matchedCustomers.map(c => c.customer_id);
      query = { customer_id: { $in: matchedIds } };
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    return res.json({ ok: true, orders, total });
  } catch (err) {
    console.error("Order fetch error:", err.message);
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
    console.log(order)
    return res.status(201).json({ ok: true, order });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
