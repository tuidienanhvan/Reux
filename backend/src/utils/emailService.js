import nodemailer from 'nodemailer';
import { renderVerificationEmail, renderUnlockEmail, renderPasswordChangeEmail, renderForgotPasswordEmail } from './renderTemplate.js';

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: (process.env.SMTP_PORT || '587') === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Xác minh kết nối SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('Lỗi kết nối SMTP:', error);
  } else {
    console.log('Kết nối SMTP thành công');
  }
});

// Hàm gửi email xác minh
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'APP_BASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Thiếu các biến môi trường: ${missingEnvVars.join(', ')}`);
    }

    console.log('Cấu hình SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });

    const verificationUrl = `${process.env.APP_FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const htmlContent = await renderVerificationEmail({ verificationUrl });

    const mailOptions = {
      from: `"Your App Name" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Xác minh tài khoản của bạn',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã gửi:', info.messageId);
    return { success: true, message: 'Email xác minh đã được gửi' };
  } catch (error) {
    console.error('Lỗi khi gửi email xác minh:', error);
    throw new Error(`Lỗi khi gửi email xác minh: ${error.message}`);
  }
};

export const sendUnlockEmail = async (email, unlockToken) => {
  const unlockUrl = `${process.env.APP_FRONTEND_URL}/unlock-account?token=${unlockToken}`;
  const htmlContent = await renderUnlockEmail({ unlockUrl });

  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Tài khoản của bạn đã bị khóa - Hành động cần thiết',
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email mở khóa đã gửi:', info.messageId);
};

export const sendPasswordChangeEmail = async (email, token) => {
  const changeUrl = `${process.env.APP_FRONTEND_URL}/confirm-password-change?token=${token}`;
  const htmlContent = await renderPasswordChangeEmail({ changeUrl });

  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Xác nhận đổi mật khẩu",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Đã gửi email xác nhận đổi mật khẩu:", info.messageId);
};

export const sendForgotPasswordEmail = async (email, token) => {
  const forgotPasswordUrl = `${process.env.APP_FRONTEND_URL}/confirm-password-change?token=${token}`;
  const htmlContent = await renderForgotPasswordEmail({ forgotPasswordUrl });

  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Xác nhận quên mật khẩu",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Đã gửi email xác nhận quên mật khẩu:", info.messageId);
};