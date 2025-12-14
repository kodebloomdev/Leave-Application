import express from "express";
import { loginUser, getProfile, updateProfile, uploadProfilePhoto } from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);
router.post("/profile/:id/photo", upload.single("photo"), uploadProfilePhoto);

export default router;
