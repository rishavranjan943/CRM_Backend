import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rules: { type: Object, required: true },
  last_preview_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Segment", segmentSchema);
