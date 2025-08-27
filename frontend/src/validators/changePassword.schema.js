//src/validators/changePassword.schema.js

import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Mật khẩu hiện tại phải có ít nhất 8 ký tự."),

    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu mới phải chứa ít nhất 1 chữ hoa.")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt."),

    confirmPassword: z
      .string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp.",
  });
