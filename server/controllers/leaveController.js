import LeaveRequest from "../models/LeaveRequest.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";

import crypto from "crypto";
import fs from "fs";
import PDFDocument from "pdfkit";




// ---------------------------
// SEND OTP
// ---------------------------
export const sendOTP = async (req, res) => {
  try {
    const { studentId, guardian, departure, returnDate } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const leave = await LeaveRequest.create({
      student: studentId,
      guardianName: guardian,
      departureDate: departure,
      returnDate: returnDate,
      otp,
      otpExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    console.log("OTP Sent to parent:", otp);

    res.json({ success: true, leaveId: leave._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------
// VERIFY OTP
// ---------------------------
export const verifyOTP = async (req, res) => {
  try {
    const { otp, studentId } = req.body;

    const leave = await LeaveRequest.findOne({
      student: studentId,
      otp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!leave)
      return res.json({ success: false, message: "Invalid or expired OTP" });

    leave.isOtpVerified = true;

    leave.gatePassId =
      "GP" + new Date().getFullYear() + "-" + crypto.randomInt(1000, 9999);

    leave.approvedAt = new Date();
    await leave.save();

    res.json({
  success: true,
  leaveId: leave._id,  // ⭐ IMPORTANT
  gatePass: {
    passId: leave.gatePassId,
    approvedAt: leave.approvedAt
  }
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GUARDIAN PHOTO//

export const uploadGuardianPhoto = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No photo uploaded" });

  const photoPath = "/uploads/guardian_photos/" + req.file.filename;

  res.json({
    success: true,
    photo: photoPath,
  });
};


export const uploadWebcamPhoto = async (req, res) => {
  try {
    const img = req.body.image; // base64

    const base64 = img.replace(/^data:image\/png;base64,/, "");
    const filename = "webcam_" + Date.now() + ".png";
    const filepath = `uploads/guardian_photos/${filename}`;

    fs.writeFileSync(filepath, base64, "base64");

    res.json({
      success: true,
      photo: "/uploads/guardian_photos/" + filename,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GENERATE GATEPASS//
export const generateGatePassPDF = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await LeaveRequest.findById(leaveId).populate("student");

    if (!leave) return res.status(404).send("Invalid Gate Pass");

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("SCHOOL GATE PASS", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Pass ID: ${leave.gatePassId}`);
    doc.text(`Student: ${leave.student.name}`);
    doc.text(`Class / Section: ${leave.student.class} - ${leave.student.section}`);
    doc.text(`Guardian: ${leave.guardianName}`);
    doc.text(`Departure: ${new Date(leave.departureDate).toLocaleString()}`);
    doc.text(`Return: ${new Date(leave.returnDate).toLocaleString()}`);
    doc.text(`Purpose: ${leave.purpose}`);

    doc.moveDown();
    doc.text("Scan at gate for verification");

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ------------------------
// Dashboard Summary Stats
// ------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const total = await LeaveRequest.countDocuments();
    const approved = await LeaveRequest.countDocuments({ status: "Approved" });
    const pending = await LeaveRequest.countDocuments({ status: "Pending" });
    const rejected = await LeaveRequest.countDocuments({ status: "Rejected" });

    res.json({ total, approved, pending, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------
// Recent leave requests
// ------------------------
export const getRecentRequests = async (req, res) => {
  try {
    const recent = await LeaveRequest.find()
      .populate("student")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listLeaveRequests = async (req, res) => {
  try {
    const { startDate, endDate, status, klass, section, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search || klass || section) {
      const q = {};
      if (search) q.$or = [{ name: { $regex: search, $options: "i" } }, { admissionNo: search }];
      if (klass) q.class = klass;
      if (section) q.section = section;
      const stu = await Student.find(q, { _id: 1 });
      filter.student = { $in: stu.map((s) => s._id) };
    }
    const items = await LeaveRequest.find(filter)
      .populate("student")
      .sort({ createdAt: -1 });
    const mapped = items.map((l) => {
      const d1 = new Date(l.departureDate);
      const d2 = new Date(l.returnDate);
      const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      return {
        id: l._id,
        student: { id: l.student?._id, name: l.student?.name, class: l.student?.class, section: l.student?.section },
        departureDate: l.departureDate,
        returnDate: l.returnDate,
        status: l.status,
        days,
        purpose: l.purpose,
        createdAt: l.createdAt,
      };
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { justification, decidedBy } = req.body;
    const leave = await LeaveRequest.findById(id).populate("student");
    if (!leave) return res.status(404).json({ message: "Not found" });
    leave.status = "Approved";
    leave.decisionJustification = justification || "";
    leave.decidedBy = decidedBy || "Principal";
    leave.decidedAt = new Date();
    await leave.save();

    const start = new Date(leave.departureDate);
    const end = new Date(leave.returnDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      await Attendance.updateOne(
        { student: leave.student._id, date: day },
        { $set: { status: "On Leave" } },
        { upsert: true }
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { justification, decidedBy } = req.body;
    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ message: "Not found" });
    leave.status = "Rejected";
    leave.decisionJustification = justification || "";
    leave.decidedBy = decidedBy || "Principal";
    leave.decidedAt = new Date();
    await leave.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSummaryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const total = await LeaveRequest.countDocuments(filter);
    const pending = await LeaveRequest.countDocuments({ ...filter, status: "Pending" });
    const approved = await LeaveRequest.countDocuments({ ...filter, status: "Approved" });
    const rejected = await LeaveRequest.countDocuments({ ...filter, status: "Rejected" });
    const list = await LeaveRequest.find({ ...filter, status: "Approved" });
    let totalDays = 0;
    for (const l of list) {
      const d1 = new Date(l.departureDate);
      const d2 = new Date(l.returnDate);
      totalDays += Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    }
    res.json({ total, pending, approved, rejected, totalDays });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const items = await LeaveRequest.find({ student: studentId, status: "Approved" }).sort({ createdAt: -1 });
    let totalDays = 0;
    const history = items.map((l) => {
      const d1 = new Date(l.departureDate);
      const d2 = new Date(l.returnDate);
      const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      totalDays += days;
      return { id: l._id, purpose: l.purpose, from: l.departureDate, to: l.returnDate, days, status: l.status, decidedAt: l.decidedAt };
    });
    res.json({ totalDays, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
