import express from "express";
import { sendOTP, verifyOTP } from "../controllers/leaveController.js";
import upload from "../middleware/upload.js";
import { uploadGuardianPhoto } from "../controllers/leaveController.js";
import { uploadWebcamPhoto } from "../controllers/leaveController.js";
import { generateGatePassPDF } from "../controllers/leaveController.js";
import { getDashboardStats, getRecentRequests, listLeaveRequests, approveLeave, rejectLeave, getSummaryAnalytics, getStudentAnalytics } from "../controllers/leaveController.js";








const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/upload-photo", upload.single("photo"), uploadGuardianPhoto);
router.post("/upload-webcam", uploadWebcamPhoto);
router.get("/gatepass/:leaveId", generateGatePassPDF);
router.get("/dashboard-stats", getDashboardStats);
router.get("/recent", getRecentRequests);
router.get("/list", listLeaveRequests);
router.patch("/:id/approve", approveLeave);
router.patch("/:id/reject", rejectLeave);
router.get("/analytics/summary", getSummaryAnalytics);
router.get("/analytics/student/:studentId", getStudentAnalytics);





export default router;
