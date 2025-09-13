import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  customer_id: { type: String, required: true },
  message: { type: String, required: true },
  vendor_message_id: { type: String },
  status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
  attempted_at: { type: Date, default: Date.now },
  delivered_at: { type: Date },
  failure_reason: { type: String }
});

export default mongoose.model("CommunicationLog", logSchema);
