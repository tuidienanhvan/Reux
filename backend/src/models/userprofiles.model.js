import mongoose from 'mongoose';
const { Schema } = mongoose;

const userProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    avatarURL: String,
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        trim: true
    },
    dateOfBirth: Date,
    bio: String,
    location: {
        type: String,
        trim: true,
        maxlength: 100
    }
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;