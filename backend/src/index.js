// src/index.js
import express from "express";
import './config/loadEnv.js';
import cookieParser from "cookie-parser";
import cors from 'cors';

import cloudinaryRoutes from "./routes/cloudinary.route.js";
import friendRoutes from './routes/friend.routes.js';
import messageRoutes from "./routes/message.route.js";
import authRoutes from "./routes/auth.route.js";
import { app, server } from './lib/socket.js'; // dùng app và server từ socket.js
import { connectDB } from "./lib/db.js";

// Debug environment variables (kiểm tra biến môi trường)
const requiredEnvVars = [
  'PORT', 'MONGO_URI', 'SMTP_HOST', 'SMTP_PORT',
  'SMTP_USER', 'SMTP_PASS', 'APP_BASE_URL', 'JWT_SECRET'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Thiếu các biến môi trường trong index.js: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

console.log('Biến môi trường trong index.js:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? '[HIDDEN]' : undefined,
  APP_BASE_URL: process.env.APP_BASE_URL,
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL,
  JWT_SECRET: process.env.JWT_SECRET ? '[HIDDEN]' : undefined,
  NODE_ENV: process.env.NODE_ENV,
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:4173"],
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

// Kết nối DB trước khi chạy server
const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối MongoDB. Dừng server:", err);
    process.exit(1);
  });