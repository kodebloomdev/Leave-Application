import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },   // Father / Mother / Uncle etc.
  contact: { type: String, required: true },
  aadhar: {type: String, default: "" },
  photo: { type: String, default: "" }          // Upload photo / capture photo
});

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    parentContact: {
      type: String,
      required: true,
    },

    // Multiple guardians (Father, Mother, Uncle…)
    guardians: [guardianSchema],

    // Status fields
    attendanceStatus: {
      type: String,
      enum: ["Present", "Absent", "On Leave"],
      default: "Present",
    },
    enrollmentStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
