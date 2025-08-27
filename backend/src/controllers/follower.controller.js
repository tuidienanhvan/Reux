//src/controllers/follower.controller.js

import Follower from '../models/follower.model.js';

export const followUser = async (req, res) => {
  const { followerId, followingId } = req.body;

  if (followerId === followingId)
    return res.status(400).json({ message: 'Không thể theo dõi chính mình.' });

  const exists = await Follower.findOne({ follower: followerId, following: followingId });

  if (exists)
    return res.status(400).json({ message: 'Đã theo dõi rồi.' });

  const follow = await Follower.create({ follower: followerId, following: followingId });
  res.status(201).json(follow);
};

export const unfollowUser = async (req, res) => {
  const { followerId, followingId } = req.body;

  await Follower.deleteOne({ follower: followerId, following: followingId });
  res.json({ message: 'Đã huỷ theo dõi.' });
};
