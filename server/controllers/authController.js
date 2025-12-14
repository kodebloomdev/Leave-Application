import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config.js";
import fs from "fs";

// LOGIN
export const loginUser = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const query = email ? { email } : { username };
    const user = await User.findOne(query);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.active === false) return res.json({ success: false, message: "Account is deactivated" });
    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.json({ success: false, error });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { name: req.body.name, email: req.body.email, phone: req.body.phone };
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const photoPath = `/uploads/profile_photos/${file.filename}`;
    const user = await User.findByIdAndUpdate(id, { photo: photoPath }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, photo: photoPath, user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
