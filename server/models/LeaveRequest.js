import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },

  guardianName: String,
  guardianRelation: String,
  guardianPhoto: String,

  departureDate: Date,
  returnDate: Date,
  purpose: String,
  notes: String,

  otp: String,
  otpExpiresAt: Date,
  isOtpVerified: { type: Boolean, default: false },

  gatePassId: String,
  approvedAt: Date,

  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  decisionJustification: { type: String, default: "" },
  decidedBy: { type: String, default: "" },
  decidedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("LeaveRequest", leaveSchema);
