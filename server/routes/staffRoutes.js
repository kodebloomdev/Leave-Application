import express from "express";
import { createStaff, listStaff, updateStaff, setActive, assignStudent, getAssignedStudents, getStaffLeaves } from "../controllers/staffController.js";

const router = express.Router();

router.get("/", listStaff);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.patch("/:id/active", setActive);
router.post("/assign", assignStudent);
router.get("/assigned/:staffId", getAssignedStudents);
router.get("/leaves/:staffId", getStaffLeaves);


export default router;

