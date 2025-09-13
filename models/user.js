import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  google_id: { type: String, unique: true },
  name: String,
  email: String,
  picture: String,
  created_at: { type: Date, default: Date.now }
});



export default mongoose.model("User", userSchema);
