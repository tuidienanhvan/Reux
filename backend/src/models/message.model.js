// src/models/message.model.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * conversationKey: khóa hội thoại bất biến cho cặp user
 *   -> `${min(senderID, receiverID)}_${max(senderID, receiverID)}`
 * readAt: đánh dấu đã đọc ở phía receiver (null nếu chưa đọc)
 * deliveredAt: mốc giao tới server/thành công
 * status: trạng thái tin nhắn (delivered | seen)
 * lastMessage: đánh dấu tin nhắn cuối cùng trong hội thoại
 */
const messageSchema = new Schema({
  senderID:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversationKey: { type: String, required: true, index: true },
  type:     { type: String, enum: ['text', 'image', 'file', 'voice'], default: 'text' },
  content:  { type: String, maxlength: 2000 }, // Ghi chú: Dùng khi type là text
  mediaUrl: { type: String },                  // Ghi chú: Dùng khi type là image, file, hoặc voice
  readAt:      { type: Date, default: null },  // Ghi chú: Receiver đã đọc khi không null
  status: { type: String, enum: ['delivered', 'seen'], default: 'delivered' }, // Ghi chú: Trạng thái tin nhắn
  lastMessage: { type: Boolean, default: false, index: true }, // Ghi chú: Đánh dấu tin nhắn cuối cùng
}, { timestamps: true });

/** Index tối ưu:
 * - conversationKey + createdAt: lấy lịch sử & lastMessage rất nhanh
 * - senderID/receiverID: thống kê theo user
 * - conversationKey + lastMessage: tối ưu truy vấn tin nhắn cuối cùng
 */
messageSchema.index({ conversationKey: 1, createdAt: -1 });
messageSchema.index({ senderID: 1, receiverID: 1, createdAt: -1 });
messageSchema.index({ conversationKey: 1, lastMessage: 1 });

export default mongoose.model('Message', messageSchema);