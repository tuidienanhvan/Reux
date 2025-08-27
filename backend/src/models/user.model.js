import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpiration: Date,
    unlockToken: String ,
    unlockTokenExpiration: String,
    passwordResetToken: String,
    passwordResetTokenExpiration: Date,
    passwordChangeToken: String,
    passwordChangeTokenExpiration: Date,
    pendingPasswordHash: String,
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    lastPasswordChange: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockoutEnd: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;