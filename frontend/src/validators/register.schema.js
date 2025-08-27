// src/validators/register.schema.js

import { z } from "zod";

/**
 * Schema kiểm tra dữ liệu đăng ký tài khoản
 * - Đảm bảo thông tin hợp lệ trước khi xử lý.
 */
export const registerSchema = z
  .object({
    // Username: tối thiểu 5 ký tự
    username: z.string().min(5, "Tên đăng nhập phải có ít nhất 5 ký tự."),
    
    // Email: đúng định dạng email (vd: user@example.com)
    email: z.string().email("Email không hợp lệ."),

    firstName: z.string().min(1, "First name is required"),
    
    lastName: z.string().min(1, "Last name is required"),

    // Mật khẩu: tối thiểu 8 ký tự, chứa ít nhất 1 chữ hoa và 1 ký tự đặc biệt
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.") 
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa.") // Tăng độ mạnh mật khẩu
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt."), // Ngăn mật khẩu quá đơn giản
    
    // Xác nhận mật khẩu: tối thiểu 8 ký tự
    confirmPassword: z.string().min(8, "Xác nhận mật khẩu phải có ít nhất 8 ký tự."),
  })
  // Kiểm tra mật khẩu và xác nhận mật khẩu phải trùng khớp
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // Gắn lỗi vào trường confirmPassword
    message: "Mật khẩu và xác nhận mật khẩu không khớp.",
  });
