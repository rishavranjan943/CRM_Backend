import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  segment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Segment", required: true },
  message_template: { type: String, required: true },
  audience_size: { type: Number, default: 0 },
  status: { type: String, enum: ["queued", "running", "completed"], default: "queued" },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Campaign", campaignSchema);
