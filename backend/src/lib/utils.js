//src/lib/utils.js

import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Access token hết hạn sau 15 phút
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d', // Refresh token hết hạn sau 7 ngày
  });

  // Lưu access token vào cookie
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 phút
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  });

  // Lưu refresh token vào cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  });

  return { accessToken, refreshToken };
};