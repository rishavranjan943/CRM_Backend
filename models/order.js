import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true },
  customer_id: { type: String, required: true },
  amount: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  owner_user_id: { type: String, required: true }
});

export default mongoose.model("Order", orderSchema);
