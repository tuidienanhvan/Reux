//src/utils/helpers.js

// Kiểm tra trạng thái người dùng để đảm bảo hợp lệ trước khi thực hiện hành động
export const checkUserConditions = (user) => {
  if (!user) return { ok: false, message: "Người dùng không tồn tại." };
  if (!user.isActive) return { ok: false, message: "Tài khoản đã bị vô hiệu hóa." };
  if (!user.isVerified) return { ok: false, message: "Email chưa được xác minh." };
  return { ok: true };
};
