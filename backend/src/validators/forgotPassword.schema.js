//src/validators/forgotPassword.schema.js

import { z } from "zod";

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .email("Email không hợp lệ.")
      .min(1, "Email là bắt buộc."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu mới phải chứa ít nhất 1 chữ hoa.")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt."),
    confirmPassword: z
      .string()
      .min(1, "Xác nhận mật khẩu là bắt buộc."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp.",
  });