import express from "express";
import { listClasses, getWeek, upsertPeriod, copySchedule, getSummary, getChangesToday } from "../controllers/timetableController.js";

const router = express.Router();

router.get("/classes", listClasses);
router.get("/week", getWeek);
router.post("/upsert", upsertPeriod);
router.post("/copy", copySchedule);
router.get("/summary", getSummary);
router.get("/changes", getChangesToday);

export default router;
