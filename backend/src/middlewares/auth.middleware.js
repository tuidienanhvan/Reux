//src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';

// Middleware xác thực token JWT
// Ghi chú: Xác thực access token và làm mới token nếu cần thiết
export const verifyToken = async (req, res, next) => {
  try {
    // Lấy access token từ cookie hoặc header Authorization
    // Ghi chú: Kiểm tra xem có cookie 'jwt' hoặc header 'Authorization' với định dạng 'Bearer <token>' không
    let token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token not found' });
    }

    try {
      // Xác minh access token
      // Ghi chú: Sử dụng JWT_SECRET từ biến môi trường để xác minh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select(
        '-passwordHash -pendingPasswordHash -verificationToken -unlockToken -passwordChangeToken'
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Kiểm tra trạng thái tài khoản
      // Ghi chú: Đảm bảo tài khoản đang hoạt động, đã xác minh email, và không bị khóa
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Email is not verified' });
      }
      if (user.lockoutEnd && user.lockoutEnd > new Date()) {
        return res.status(423).json({
          message: `Account is locked until ${user.lockoutEnd.toLocaleString()}`,
        });
      }

      // Gắn thông tin người dùng vào req.user
      // Ghi chú: Lưu thông tin người dùng cần thiết vào req.user để sử dụng trong các middleware/controller tiếp theo
      req.user = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Access token hết hạn, kiểm tra refresh token
        // Ghi chú: Nếu access token hết hạn, thử sử dụng refresh token để tạo access token mới
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          return res.status(401).json({ message: 'Refresh token not found' });
        }

        try {
          // Xác minh refresh token
          // Ghi chú: Sử dụng REFRESH_TOKEN_SECRET từ biến môi trường để xác minh refresh token
          const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
          const user = await User.findById(decodedRefresh.userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Kiểm tra trạng thái tài khoản trước khi làm mới token
          // Ghi chú: Đảm bảo tài khoản hợp lệ trước khi cấp access token mới
          if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
          }
          if (!user.isVerified) {
            return res.status(403).json({ message: 'Email is not verified' });
          }
          if (user.lockoutEnd && user.lockoutEnd > new Date()) {
            return res.status(423).json({
              message: `Account is locked until ${user.lockoutEnd.toLocaleString()}`,
            });
          }

          // Tạo access token mới
          // Ghi chú: Gọi hàm generateToken để tạo access token mới và lưu vào cookie
          const { accessToken } = generateToken(user._id, res);
          req.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
          };

          // Gửi access token mới trong header
          // Ghi chú: Gửi access token mới qua header X-New-Token để client cập nhật
          res.setHeader('X-New-Token', accessToken);
          next();
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError.message);
          if (refreshError.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Refresh token expired' });
          }
          if (refreshError.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid refresh token' });
          }
          return res.status(500).json({ message: 'Server error during refresh token verification' });
        }
      } else {
        throw error; // Ném lỗi khác (như JsonWebTokenError)
      }
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};