import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    periodIndex: { type: Number, required: true },
    change: { type: String, required: true },
    appliesTo: { type: String, default: "" },
    type: { type: String, enum: ["Substitution", "Free period", "Schedule change", "Remedial"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ScheduleChange", changeSchema);
