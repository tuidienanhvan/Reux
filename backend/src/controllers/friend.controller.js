// src/controllers/friend.controller.js
import mongoose from "mongoose";
import Friend from "../models/friend.model.js";
import Message from "../models/message.model.js";
import { getUserIds } from "./auth.controller.js";

// ==================================================
// Helper: safe ObjectId
// ==================================================
const safeObjectId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null);

// ==================================================
// Helper: Get friend IDs
// ==================================================
export const getFriendIds = async (_id) => {
  if (!mongoose.Types.ObjectId.isValid(_id)) return [];

  const friends = await Friend.find({
    $or: [
      { requester: _id, status: "accepted" },
      { addressee: _id, status: "accepted" },
    ],
  }).select("requester addressee").lean();

  return [
    ...new Set(
      friends.map((f) =>
        f.requester?.toString() === _id.toString() ? f.addressee?.toString() : f.requester?.toString()
      )
    ),
  ].filter(Boolean);
};

// ==================================================
// API: Get friends
// ==================================================
export const getFriends = async (req, res) => {
  try {
    const me = req.user._id;
    const skip = +req.query.skip || 0;
    const limit = 10;

    const friendIds = await getFriendIds(me);
    if (friendIds.length === 0) return res.json({ data: [], hasMore: false });

    const paginatedIds = friendIds.slice(skip, skip + limit);
    const friends = await Promise.all(paginatedIds.map((id) => getUserIds(id)));

    return res.json({
      data: friends.filter(Boolean),
      hasMore: skip + limit < friendIds.length,
    });
  } catch (e) {
    console.error("getFriends error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// API: Get strangers
// ==================================================
export const getStrangers = async (req, res) => {
  try {
    const me = req.user._id;
    const skip = +req.query.skip || 0;
    const limit = 10;

    const friendSet = new Set((await getFriendIds(me)).map(String));
    const meObj = safeObjectId(me);

    const pairs = await Message.aggregate([
      { $match: { $or: [{ senderID: meObj }, { receiverID: meObj }] } },
      {
        $project: {
          otherUserId: { $cond: [{ $eq: ["$senderID", meObj] }, "$receiverID", "$senderID"] },
        },
      },
      { $group: { _id: "$otherUserId" } },
    ]);

    const strangerIds = pairs
      .map((p) => p._id?.toString())
      .filter((id) => id && !friendSet.has(id) && id !== me.toString());

    if (strangerIds.length === 0) return res.json({ data: [], hasMore: false });

    const paginatedIds = strangerIds.slice(skip, skip + limit);
    const strangers = await Promise.all(paginatedIds.map((id) => getUserIds(id)));

    return res.json({
      data: strangers.filter(Boolean),
      hasMore: skip + limit < strangerIds.length,
    });
  } catch (e) {
    console.error("getStrangers error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// API: Send friend request
// ==================================================
export const sendFriendRequest = async (req, res) => {
  try {
    const from = req.user._id;
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ message: "toUserId is required" });
    if (from.toString() === toUserId) return res.status(400).json({ message: "Cannot friend yourself" });

    const existing = await Friend.findOne({
      $or: [
        { requester: from, addressee: toUserId },
        { requester: toUserId, addressee: from },
      ],
    });

    if (existing) {
      return res.status(400).json({
        message: existing.status === "accepted" ? "Already friends" : "Friend request already exists",
      });
    }

    const friendReq = await Friend.create({ requester: from, addressee: toUserId, status: "pending" });

    return res.status(201).json({ message: "Friend request sent", data: friendReq });
  } catch (e) {
    console.error("sendFriendRequest error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// API: Accept friend request
// ==================================================
export const acceptFriendRequest = async (req, res) => {
  try {
    const me = req.user._id;
    const { fromUserId } = req.body;

    const request = await Friend.findOneAndUpdate(
      { requester: fromUserId, addressee: me, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Friend request not found" });

    return res.json({ message: "Friend request accepted", data: request });
  } catch (e) {
    console.error("acceptFriendRequest error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// API: Remove friend
// ==================================================
export const removeFriend = async (req, res) => {
  try {
    const me = req.user._id;
    const { userId } = req.body;

    const friend = await Friend.findOneAndDelete({
      $or: [
        { requester: me, addressee: userId },
        { requester: userId, addressee: me },
      ],
    });

    if (!friend) return res.status(404).json({ message: "Friend relationship not found" });

    return res.json({ message: "Friend removed" });
  } catch (e) {
    console.error("removeFriend error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};
