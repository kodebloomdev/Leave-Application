import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, default: "" },
    teacher: { type: String, default: "" },
    room: { type: String, default: "" },
    type: { type: String, enum: ["Regular", "Free", "Substitution", "Assembly", "Remedial"], default: "Regular" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    periods: { type: [periodSchema], default: [] },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    class: { type: String, required: true },
    section: { type: String, required: true },
    week: { type: [daySchema], default: [] },
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, section: 1 }, { unique: true });

export default mongoose.model("Timetable", timetableSchema);
