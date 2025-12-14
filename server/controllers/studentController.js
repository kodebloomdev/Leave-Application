import Student from "../models/Student.js";

// SEARCH STUDENT (name or admission no)
export const searchStudent = async (req, res) => {
  try {
    const query = req.query.query;

    const student = await Student.findOne({
      $or: [
        { admissionNo: query },
        { name: { $regex: query, $options: "i" } }
      ]
    }).populate("assignedStaff");

    if (!student) return res.json({ student: null });

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL STUDENTS
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("assignedStaff");
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE STUDENT
export const createStudent = async (req, res) => {
  try {
    const data = req.body;
    const exists = await Student.findOne({ admissionNo: data.admissionNo });
    if (exists) {
      return res.status(409).json({ message: "Student already exists" });
    }

    const student = await Student.create(data);
    res.status(201).json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await Student.findByIdAndUpdate(id, data, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET STUDENT BY ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate("assignedStaff");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
