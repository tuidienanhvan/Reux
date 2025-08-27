//src/models/friend.model.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

// Định nghĩa schema cho quan hệ bạn bè
const friendSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Người gửi lời mời
  addressee: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Người nhận lời mời
  status: {
    type: String,
    enum: ['pending', 'accepted'], // Trạng thái: đang chờ hoặc đã chấp nhận
    default: 'pending'
  },
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo chỉ mục để đảm bảo không có quan hệ trùng lặp
friendSchema.index({ requester: 1, addressee: 1 }, { unique: true });

export default mongoose.model('Friend', friendSchema);