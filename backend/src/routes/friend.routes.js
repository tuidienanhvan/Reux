//src/routes/friend.routes.js

// src/routes/friend.routes.js

import express from 'express';
import { 
  getFriends, 
  getStrangers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  removeFriend 
} from '../controllers/friend.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Lấy danh sách bạn bè
router.get('/friends', verifyToken, getFriends);
// Lấy danh sách người lạ
router.get('/strangers', verifyToken, getStrangers);
// Gửi lời mời kết bạn
router.post('/send', verifyToken, sendFriendRequest);
// Chấp nhận lời mời kết bạn
router.post('/accept', verifyToken, acceptFriendRequest);
// Hủy kết bạn
router.post('/remove', verifyToken, removeFriend);

export default router;