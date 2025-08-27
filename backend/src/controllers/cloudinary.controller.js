// src/controllers/cloudinary.controller.js
import { generateUploadSignature } from "../lib/cloudinary.js";

// GET /api/cloudinary/upload-signature?folder=chat-app
export const getUploadSignature = async (req, res) => {
  try {
    const { folder = "chat-app", public_id } = req.query; // có thể thêm params khác nếu cần
    const params = { folder }; // nếu dùng public_id thì thêm: if (public_id) params.public_id = public_id;

    const sig = generateUploadSignature(params);
    return res.json(sig);
  } catch (err) {
    console.error("getUploadSignature error:", err);
    return res.status(500).json({ message: "Failed to generate signature" });
  }
};
