//src/routes/auth.route.js

import express from 'express';
import {
  login,
  logout,
  register,
  verifyEmail,
  unlockAccount,
  requestPasswordChange,
  confirmPasswordChange,
  updateProfile,
  checkAuth,
  refreshToken,
  getUser,
  forgotPassword
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

// Import schema
import { registerSchema } from '../validators/register.schema.js';
import { loginSchema } from '../validators/login.schema.js';
import { changePasswordSchema } from '../validators/changePassword.schema.js';
import { updateProfileSchema } from '../validators/profile.schema.js';
import { forgotPasswordSchema } from '../validators/forgotPassword.schema.js';

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.get('/logout', logout);
router.get('/verify-email', verifyEmail);
router.get('/unlock-account', unlockAccount);
router.get('/verify-token', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Token hợp lệ', userId: req.user._id });
});
router.post(
  '/request-password-change',
  verifyToken,
  validate(changePasswordSchema),
  requestPasswordChange
);
router.get('/confirm-password-change', confirmPasswordChange);
router.patch(
  '/update-profile',
  verifyToken,
  validate(updateProfileSchema),
  updateProfile
);
router.post('/refresh-token', refreshToken);

// Dynamic param để cuối cùng (đặt rõ ràng là userId)
router.get('/user/:userId', verifyToken, getUser);

export default router;