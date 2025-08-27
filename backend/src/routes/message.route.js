// src/routes/message.routes.js

import express from "express";
import { getMessages, sendMessage, getLastMessageFriends, getLastMessageStrangers } from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, sendMessage);

// static routes
router.get("/last-messages-friends", verifyToken, getLastMessageFriends);
router.get("/last-messages-strangers", verifyToken, getLastMessageStrangers);

// dynamic route đặt cuối cùng
router.get("/:_id", verifyToken, getMessages);


export default router;