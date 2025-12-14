import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import config from "./config.js";
import studentRoutes from "./routes/studentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(config.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/uploads", express.static("uploads"));



app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
