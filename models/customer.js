import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customer_id: { type: String, unique: true },
  name: String,
  email: String,
  phone: String,
  total_spend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  last_order_at: Date,
  owner_user_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Customer", customerSchema);
