//src/validators/login.schema.js

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ."),
  password: z.string().min(1, "Mật khẩu là bắt buộc."),
});
