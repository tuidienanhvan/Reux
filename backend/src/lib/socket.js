// src/lib/socket.js

import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getFriendIds } from "../controllers/friend.controller.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:4173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// ==================================================
// In-memory map: userId -> socketId
// ==================================================
const userSocketMap = {};

// ==================================================
// Helper: Get receiver's socket id
// ==================================================
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ==================================================
// Helper: Check online status
// ==================================================
export function checkOnlineStatus(userIds) {
  const online = [];
  const offline = [];

  userIds.forEach((uid) => {
    if (uid && userSocketMap[uid]) {
      online.push(uid);
    } else {
      offline.push(uid);
    }
  });

  return { online, offline };
}

// ==================================================
// Safe ObjectId
// ==================================================
function safeObjectId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

// ==================================================
// Emit online friends
// ==================================================
async function emitOnlineFriends(userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;

    const friendIds = await getFriendIds(userId);
    const { online: onlineFriends } = checkOnlineStatus(friendIds);

    const sid = userSocketMap[userId];
    if (sid) io.to(sid).emit("getOnlineFriends", onlineFriends);
  } catch (e) {
    console.error("emitOnlineFriends error:", e);
  }
}

// ==================================================
// Emit online strangers
// ==================================================
async function emitOnlineStrangers(userId) {
  try {
    const meObj = safeObjectId(userId);
    if (!meObj) return;

    const friendSet = new Set((await getFriendIds(userId)).map(String));

    const pairs = await Message.aggregate([
      { $match: { $or: [{ senderID: meObj }, { receiverID: meObj }] } },
      {
        $project: {
          otherUserId: {
            $cond: [{ $eq: ["$senderID", meObj] }, "$receiverID", "$senderID"],
          },
        },
      },
      { $group: { _id: "$otherUserId" } },
    ]);

    const strangerIds = pairs
      .map((p) => p._id?.toString())
      .filter((uid) => uid && !friendSet.has(uid) && uid !== userId);

    const { online: onlineStrangerIds } = checkOnlineStatus(strangerIds);

    const sid = userSocketMap[userId];
    if (!sid) return;

    if (onlineStrangerIds.length === 0) {
      io.to(sid).emit("getOnlineStrangers", []);
      return;
    }

    const users = await User.find({
      _id: { $in: onlineStrangerIds.filter(mongoose.Types.ObjectId.isValid) },
    })
      .select("_id username email")
      .lean();

    const rows = users.map((u) => ({ user: u }));
    io.to(sid).emit("getOnlineStrangers", rows);
  } catch (e) {
    console.error("emitOnlineStrangers error:", e);
  }
}

// ==================================================
// Handle socket connections
// ==================================================
io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  if (mongoose.Types.ObjectId.isValid(userId)) {
    userSocketMap[userId] = socket.id;

    await emitOnlineFriends(userId);
    await emitOnlineStrangers(userId);

    const friendIds = await getFriendIds(userId);
    friendIds.forEach((fid) => {
      if (userSocketMap[fid]) emitOnlineFriends(fid);
    });

    socket.on("checkUserOnline", (targetUserId) => {
      try {
        const isOnline = !!userSocketMap[targetUserId];
        socket.emit("getUserOnlineStatus", { userId: targetUserId, isOnline });
      } catch (e) {
        console.error("checkUserOnline error:", e);
      }
    });
  } else {
    console.error("Socket connected with invalid userId:", userId);
    socket.disconnect();
    return;
  }

  socket.on("disconnect", async () => {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      delete userSocketMap[userId];

      const friendIds = await getFriendIds(userId);
      friendIds.forEach((fid) => {
        if (userSocketMap[fid]) emitOnlineFriends(fid);
      });

      const meObj = safeObjectId(userId);
      if (!meObj) return;

      const pairs = await Message.aggregate([
        {
          $match: {
            $or: [{ senderID: meObj }, { receiverID: meObj }],
          },
        },
        {
          $project: {
            otherUserId: {
              $cond: [{ $eq: ["$senderID", meObj] }, "$receiverID", "$senderID"],
            },
          },
        },
        { $group: { _id: "$otherUserId" } },
      ]);

      const strangerIds = pairs
        .map((p) => p._id?.toString())
        .filter((uid) => uid && friendIds.every((fid) => fid !== uid));

      strangerIds.forEach((sid) => {
        if (userSocketMap[sid]) emitOnlineStrangers(sid);
      });
    }
  });
});

export { io, app, server };
