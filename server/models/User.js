import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "warden" },
  phone: { type: String, default: "" },
  photo: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
