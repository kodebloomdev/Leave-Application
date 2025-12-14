import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";

export const createStaff = async (req, res) => {
  try {
    const { name, email, username, password, phone } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: "Email or username already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, username, password: hash, role: "staff", phone, active: true });
    res.status(201).json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listStaff = async (req, res) => {
  try {
    const users = await User.find({ role: "staff" }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, phone } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, email, username, phone }, { new: true });
    if (!user) return res.status(404).json({ message: "Staff not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const setActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(id, { active }, { new: true });
    if (!user) return res.status(404).json({ message: "Staff not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const assignStudent = async (req, res) => {
  try {
    const { studentId, staffId } = req.body;
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") return res.status(404).json({ message: "Invalid staff" });
    const student = await Student.findByIdAndUpdate(studentId, { assignedStaff: staffId }, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ student });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAssignedStudents = async (req, res) => {
  try {
    const { staffId } = req.params;
    const list = await Student.find({ assignedStaff: staffId }).populate("assignedStaff");
    res.json({ students: list });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getStaffLeaves = async (req, res) => {
  try {
    const { staffId } = req.params;

    const leaves = await Leave.find({ createdBy: staffId })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
