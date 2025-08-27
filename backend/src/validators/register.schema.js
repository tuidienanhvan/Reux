// src/validators/register.schema.js

import { z } from "zod";

z.config(z.locales.vi());

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(5, "Username phải có ít nhất 5 ký tự."),

    email: z
      .string()
      .email("Email không hợp lệ."),

    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa.")
      .regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt."),

    confirmPassword: z.string(),

    firstName: z
      .string()
      .min(1, "First name không được để trống."),

    lastName: z
      .string()
      .min(1, "Last name không được để trống."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu và xác nhận không khớp.",
  });

/*   export const validateRegister = (req, res, next) => {
  const { username, email, password, confirmPassword, firstName, lastName } = req.body;
  const errors = [];

  if (!username || typeof username !== "string" || username.length < 5) {
    errors.push({ field: "username", message: "Username phải có ít nhất 5 ký tự." });
  }

  if (!email || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    errors.push({ field: "email", message: "Email không hợp lệ." });
  }

  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Mật khẩu là bắt buộc." });
  } else {
    if (password.length < 8) {
      errors.push({ field: "password", message: "Mật khẩu phải có ít nhất 8 ký tự." });
    }
    if (!/[A-Z]/.test(password)) {
      errors.push({ field: "password", message: "Mật khẩu phải chứa ít nhất 1 chữ hoa." });
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push({ field: "password", message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt." });
    }
  }

  if (!confirmPassword || password !== confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Mật khẩu và xác nhận không khớp." });
  }

  if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
    errors.push({ field: "firstName", message: "First name không được để trống." });
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
    errors.push({ field: "lastName", message: "Last name không được để trống." });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}; */
