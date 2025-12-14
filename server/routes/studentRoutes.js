import express from "express";
import {
  searchStudent,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/search", searchStudent);
router.get("/all", getAllStudents);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.post("/create", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/ping", (req, res) => res.json({ ok: true }));

export default router;
