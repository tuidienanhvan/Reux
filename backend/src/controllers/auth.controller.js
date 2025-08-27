import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import UserProfile from "../models/userprofiles.model.js";
import {
  sendVerificationEmail,
  sendUnlockEmail,
  sendPasswordChangeEmail,
  sendForgotPasswordEmail
} from "../utils/emailService.js";
import { generateToken } from "../lib/utils.js";

const SALT_ROUNDS = 10;

// ==================================================
// Helper: getUserIds (dùng đồng bộ dữ liệu user + profile)
// ==================================================
export const getUserIds = async (userId) => {
  const user = await User.findById(userId).select("_id username email role lastLogin").lean();
  if (!user) return null;

  const profile = await UserProfile.findOne({ userId: user._id })
    .select("firstName lastName avatarURL")
    .lean();

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    avatarURL: profile?.avatarURL,
  };
};

// ==================================================
// [1] Register new user
// ==================================================
export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, email, password, firstName, lastName } = req.validatedData;

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = uuidv4();
    const verificationTokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      username,
      email,
      passwordHash,
      role: "user",
      isVerified: false,
      verificationToken,
      verificationTokenExpiration,
      isActive: true,
    });

    await user.save({ session });

    const userProfile = new UserProfile({
      userId: user._id,
      firstName,
      lastName,
    });

    await userProfile.save({ session });

    await session.commitTransaction();
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists." });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration." });
  } finally {
    session.endSession();
  }
};

// ==================================================
// [2] Login
// ==================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });
    if (!user.isVerified) return res.status(403).json({ message: "Email is not verified" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });
    if (user.lockoutEnd && user.lockoutEnd > new Date()) {
      return res.status(423).json({
        message: `Account is locked until ${user.lockoutEnd.toLocaleString()}`,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
        user.unlockToken = uuidv4();
        user.unlockTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await sendUnlockEmail(user.email, user.unlockToken);
        return res.status(423).json({
          message: "Account is locked. Check your email to unlock or try again later",
        });
      }
      await user.save();
      const attemptsLeft = 5 - user.failedLoginAttempts;
      return res.status(401).json({
        message: `Incorrect password. ${attemptsLeft} attempts remaining`,
      });
    }

    user.failedLoginAttempts = 0;
    user.lockoutEnd = null;
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateToken(user._id, res);
    const userData = await getUserIds(user._id);

    return res.status(200).json({
      message: "Login successful",
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ==================================================
// [3] Logout
// ==================================================
export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(0),
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(0),
  });
  return res.status(200).json({ message: "Logout successful" });
};

// ==================================================
// [4] Verify email
// ==================================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Verification token is required" });

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiration: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired verification token" });

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiration = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ message: "Server error during email verification" });
  }
};

// ==================================================
// [5] Unlock account
// ==================================================
export const unlockAccount = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Unlock token is required" });

    const user = await User.findOne({
      unlockToken: token,
      unlockTokenExpiration: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired unlock token" });

    user.lockoutEnd = null;
    user.failedLoginAttempts = 0;
    user.unlockToken = null;
    user.unlockTokenExpiration = null;
    await user.save();

    return res.status(200).json({ message: "Account unlocked successfully" });
  } catch (error) {
    console.error("Unlock account error:", error);
    return res.status(500).json({ message: "Server error during account unlock" });
  }
};

// ==================================================
// [6] Request password change
// ==================================================
export const requestPasswordChange = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.validatedData;

    // Find user by ID (assuming user is authenticated)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User does not exist" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Generate token and hash new password
    const passwordChangeToken = uuidv4();
    const passwordChangeTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);
    const pendingPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    user.passwordChangeToken = passwordChangeToken;
    user.passwordChangeTokenExpiration = passwordChangeTokenExpiration;
    user.pendingPasswordHash = pendingPasswordHash;
    await user.save();

    await sendPasswordChangeEmail(user.email, passwordChangeToken);

    return res.status(200).json({ message: "Password change email sent successfully" });
  } catch (error) {
    console.error("Password change request error:", error);
    return res.status(500).json({ message: "Server error during password change request" });
  }
};

// ==================================================
// [7] Confirm password change
// ==================================================
export const confirmPasswordChange = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Password change token is required" });

    const user = await User.findOne({
      passwordChangeToken: token,
      passwordChangeTokenExpiration: { $gt: new Date() },
    });

    if (!user || !user.pendingPasswordHash) {
      return res.status(400).json({ message: "Invalid or expired password change token" });
    }

    user.passwordHash = user.pendingPasswordHash;
    user.pendingPasswordHash = null;
    user.passwordChangeToken = null;
    user.passwordChangeTokenExpiration = null;
    user.lastPasswordChange = new Date();
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change confirmation error:", error);
    return res.status(500).json({ message: "Server error during password change" });
  }
};

// ==================================================
// [8] Update user profile
// ==================================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, firstName, lastName, gender, dateOfBirth, bio, location } =
      req.validatedData;

    const [user, profile] = await Promise.all([
      User.findById(userId),
      UserProfile.findOne({ userId }),
    ]);

    if (!user || !profile)
      return res.status(404).json({ message: "User or profile not found" });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
        public_id: `${userId}_${Date.now()}`,
      });
      profile.avatarURL = result.secure_url;
    }

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(409).json({ message: "Username already exists" });
      user.username = username;
      await user.save();
    }

    Object.assign(profile, {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
    });

    await profile.save();

    const updatedUser = await getUserIds(userId);
    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Server error during profile update" });
  }
};

// ==================================================
// [9] Check auth
// ==================================================
export const checkAuth = async (req, res) => {
  try {
    const user = await getUserIds(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Authentication check error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==================================================
// [10] Refresh token
// ==================================================
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token not found" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });
    if (!user.isVerified) return res.status(403).json({ message: "Email is not verified" });
    if (user.lockoutEnd && user.lockoutEnd > new Date()) {
      return res.status(423).json({
        message: `Account is locked until ${user.lockoutEnd.toLocaleString()}`,
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(user._id, res);
    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    return res.status(500).json({ message: "Server error during token refresh" });
  }
};

// ==================================================
// [11] Get user by id
// ==================================================
export const getUser = async (req, res) => {
  try {
    const userId = req.params._id;
    if (!userId) return res.status(400).json({ message: "Missing user id" });

    const data = await getUserIds(userId);
    if (!data) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(data);
  } catch (e) {
    console.error("getUser error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// [12] Forgot Password
// ==================================================
export const forgotPassword = async (req, res) => {
  try {
    console.log('ForgotPassword: Received body:', req.body);
    console.log('ForgotPassword: Validated data:', req.validatedData);
    const { email, newPassword } = req.validatedData;
    console.log('ForgotPassword: Processing email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('ForgotPassword: User not found for email:', email);
      return res.status(404).json({ message: "User does not exist" });
    }
    if (!user.isActive) {
      console.log('ForgotPassword: Account deactivated for email:', email);
      return res.status(403).json({ message: "Account is deactivated" });
    }
    console.log('ForgotPassword: User found:', user._id);

    const passwordChangeToken = uuidv4();
    const passwordChangeTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);
    console.log('ForgotPassword: Generating token:', passwordChangeToken);

    const pendingPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    console.log('ForgotPassword: Password hashed');

    user.passwordChangeToken = passwordChangeToken;
    user.passwordChangeTokenExpiration = passwordChangeTokenExpiration;
    user.pendingPasswordHash = pendingPasswordHash;
    await user.save();
    console.log('ForgotPassword: User updated with token:', passwordChangeToken);

    await sendForgotPasswordEmail(user.email, passwordChangeToken);
    console.log('ForgotPassword: Email sent to:', user.email);

    return res.status(200).json({ message: "Password change email sent successfully" });
  } catch (error) {
    console.error('ForgotPassword: Error:', error.message, error.stack);
    return res.status(500).json({ message: "Server error during forgot password request" });
  }
};