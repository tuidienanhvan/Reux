//src/models/follower.model.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

const followerSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

followerSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model('Follower', followerSchema);
