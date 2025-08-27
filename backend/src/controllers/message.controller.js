// src/controllers/message.controller.js
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { getFriendIds } from "./friend.controller.js";
import { getUserIds } from "./auth.controller.js";
import cloudinary from "../lib/cloudinary.js"; 

// ==================================================
// Helper: Build conversation key
// ==================================================
export const buildKey = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// ==================================================
// Helper: Get last messages for a list of users
// ==================================================
export const getLastMessagesForUsers = async (me, userIds) => {
  const keys = userIds.map((uid) => buildKey(me, uid));
  const messages = await Message.find({
    conversationKey: { $in: keys },
    lastMessage: true,
  }).lean();

  return messages.reduce((acc, message) => {
    acc[message.conversationKey] = message;
    return acc;
  }, {});
};

// ==================================================
// API: Send message
// ==================================================
export const sendMessage = async (req, res) => {
  try {
    const { receiverID, type = "text", content, mediaUrl } = req.body;
    const senderID = req.user._id;

    if (!receiverID) return res.status(400).json({ message: "receiverID is required" });
    if (type === "text" && !content) return res.status(400).json({ message: "content is required" });

    const receiver = await User.findById(receiverID);
    if (!receiver) return res.status(404).json({ message: "Receiver not found" });

    // FE đã upload lên Cloudinary, ở đây chỉ lấy URL
    let finalMediaUrl = null;
    if (["image", "file", "voice"].includes(type) && mediaUrl) {
      finalMediaUrl = mediaUrl;
    }

    const conversationKey = buildKey(senderID, receiverID);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Message.updateMany(
        { conversationKey, lastMessage: true },
        { $set: { lastMessage: false } },
        { session }
      );

      const newMessage = new Message({
        senderID,
        receiverID,
        conversationKey,
        type,
        content: type === "text" ? content : content || undefined,
        mediaUrl: finalMediaUrl || undefined,
        lastMessage: true,
        status: "delivered",
      });

      await newMessage.save({ session });
      await session.commitTransaction();

      const messageData = {
        _id: newMessage._id,
        senderUser: await getUserIds(newMessage.senderID),
        receiverUser: await getUserIds(newMessage.receiverID),
        type: newMessage.type,
        content: newMessage.content,
        mediaUrl: newMessage.mediaUrl,
        createdAt: newMessage.createdAt,
        status: newMessage.status,
        lastMessage: newMessage.lastMessage,
      };

      [receiverID, senderID].forEach((uid) => {
        const socketId = getReceiverSocketId(uid);
        if (socketId) io.to(socketId).emit("receiveMessage", messageData);
      });

      return res.status(201).json(messageData);
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (e) {
    console.error("sendMessage error:", e);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

// ==================================================
// API: Get friends with last message
// ==================================================
export const getLastMessageFriends = async (req, res) => {
  try {
    const me = req.user._id;
    const { skip = 0 } = req.query;
    const limit = 10;

    const friendIds = await getFriendIds(me);
    if (friendIds.length === 0) return res.json({ data: [], hasMore: false });

    const paginatedIds = friendIds.slice(+skip, +skip + limit);
    const lastMessages = await getLastMessagesForUsers(me, paginatedIds);

    const rows = await Promise.all(
      paginatedIds.map(async (id) => {
        const last = lastMessages[buildKey(me, id)] || null;
        return {
          user: await getUserIds(id),
          lastMessageInfo: last
            ? {
                ...last,
                senderUser: await getUserIds(last.senderID),
                receiverUser: await getUserIds(last.receiverID),
              }
            : null,
        };
      })
    );

    rows.sort((a, b) => {
      const ta = a.lastMessageInfo?.createdAt
        ? new Date(a.lastMessageInfo.createdAt).getTime()
        : 0;
      const tb = b.lastMessageInfo?.createdAt
        ? new Date(b.lastMessageInfo.createdAt).getTime()
        : 0;
      return tb - ta;
    });

    return res.json({ data: rows, hasMore: +skip + limit < friendIds.length });
  } catch (e) {
    console.error("getLastMessageFriends error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// API: Get strangers with last message
// ==================================================
export const getLastMessageStrangers = async (req, res) => {
  try {
    const me = req.user._id;
    const { skip = 0 } = req.query;
    const limit = 10;

    const friendSet = new Set((await getFriendIds(me)).map(String));
    const meObj = new mongoose.Types.ObjectId(me);

    const pairs = await Message.aggregate([
      {
        $match: {
          $or: [{ senderID: meObj }, { receiverID: meObj }],
          lastMessage: true,
        },
      },
      {
        $project: {
          otherUserId: {
            $cond: [{ $eq: ["$senderID", meObj] }, "$receiverID", "$senderID"],
          },
          createdAt: 1,
          conversationKey: 1,
        },
      },
      { $group: { _id: "$otherUserId", lastKey: { $first: "$conversationKey" } } },
    ]);

    const strangerIds = pairs
      .map((p) => p._id.toString())
      .filter((id) => !friendSet.has(id) && id !== me.toString());

    if (strangerIds.length === 0) return res.json({ data: [], hasMore: false });

    const paginatedIds = strangerIds.slice(+skip, +skip + limit);
    const lastMessages = await getLastMessagesForUsers(me, paginatedIds);

    const rows = await Promise.all(
      paginatedIds.map(async (id) => {
        const last = lastMessages[buildKey(me, id)] || null;
        return {
          user: await getUserIds(id),
          lastMessageInfo: last
            ? {
                ...last,
                senderUser: await getUserIds(last.senderID),
                receiverUser: await getUserIds(last.receiverID),
              }
            : null,
        };
      })
    );

    rows.sort((a, b) => {
      const ta = a.lastMessageInfo?.createdAt
        ? new Date(a.lastMessageInfo.createdAt).getTime()
        : 0;
      const tb = b.lastMessageInfo?.createdAt
        ? new Date(b.lastMessageInfo.createdAt).getTime()
        : 0;
      return tb - ta;
    });

    return res.json({ data: rows, hasMore: +skip + limit < strangerIds.length });
  } catch (e) {
    console.error("getLastMessageStrangers error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};


// ==================================================
// API: Get messages between me and another user
// ==================================================
export const getMessages = async (req, res) => {
  try {
    const me = req.user._id;
    const otherUserId = req.params._id;
    if (!otherUserId) return res.status(400).json({ message: "_id param required" });

    const conversationKey = buildKey(me, otherUserId);

    const messages = await Message.find({ conversationKey }).sort({ createdAt: 1 }).lean();

    const rows = await Promise.all(
      messages.map(async (m) => ({
        ...m,
        senderUser: await getUserIds(m.senderID),
        receiverUser: await getUserIds(m.receiverID),
      }))
    );

    return res.json(rows);
  } catch (e) {
    console.error("getMessages error:", e);
    return res.status(500).json({ message: "Failed to get messages" });
  }
};
