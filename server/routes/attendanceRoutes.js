import express from "express";
import { markAttendance, getOverview, getClasswise, getRecentAbsences, getMonthlyAverage } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/overview", getOverview);
router.get("/classwise", getClasswise);
router.get("/recent", getRecentAbsences);
router.get("/monthly-average", getMonthlyAverage);

export default router;
