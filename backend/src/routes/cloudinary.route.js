import express from "express";
import { getUploadSignature } from "../controllers/cloudinary.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // nếu có auth check

const router = express.Router();

// Chỉ user đã login mới được request chữ ký
router.get("/upload-signature", verifyToken, getUploadSignature);

export default router;
