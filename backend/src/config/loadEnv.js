import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

/* 
========================= 🌱 GHI CHÚ DÙNG .env TRONG NODE.JS =========================

📌 MỤC TIÊU:
Đọc được các biến môi trường từ file `.env` (ví dụ: PORT, MONGO_URI, JWT_SECRET,...)
để sử dụng trong dự án Node.js, nhất là khi tách code ra nhiều file/module.

------------------------------------------------------------------------------------
🟢 CÁCH 1 - DÙNG CommonJS (require):
------------------------------------------------------------------------------------
✅ Cách đơn giản, Node.js hỗ trợ trực tiếp:
- File index.js hoặc app.js:

    const dotenv = require('dotenv');
    dotenv.config();

- Sau đó, ở bất kỳ file nào bạn cũng có thể truy cập được biến môi trường:

    process.env.JWT_SECRET

📌 Vì CommonJS load tất cả module theo cách đồng bộ nên .env sẽ có mặt ở mọi nơi.

------------------------------------------------------------------------------------
🔵 CÁCH 2 - DÙNG ESModule (import):
------------------------------------------------------------------------------------
✅ Nếu bạn đang dùng `type: "module"` trong `package.json` và dùng `import` thay vì `require`,
bạn **phải tự gọi** dotenv.config() bằng cú pháp import:

    import dotenv from 'dotenv';
    dotenv.config();

📌 Tuy nhiên, nếu bạn chỉ gọi dotenv ở `index.js`, thì các file khác khi `import` vào 
**có thể KHÔNG thấy được** `process.env` vì ESModule tách biệt và thực thi không đồng bộ hoàn toàn.

👉 GIẢI PHÁP:
- Tạo một file riêng gọi là `loadEnv.js` trong thư mục `config/`:

    // config/loadEnv.js
    import dotenv from 'dotenv';
    dotenv.config();

- Sau đó import file này sớm nhất trong `index.js`:

    import './config/loadEnv.js';

🛑 Nếu bạn KHÔNG import sớm `loadEnv.js` thì các file như `db.js`, `auth.controller.js` v.v...
có thể bị lỗi "undefined" khi dùng `process.env`.

------------------------------------------------------------------------------------
✅ KẾT LUẬN:
- Với CommonJS: chỉ cần `require('dotenv').config()` 1 lần là đủ.
- Với ESModule: nên tạo và import `loadEnv.js` từ sớm để đảm bảo mọi module thấy được `process.env`.

=====================================================================================
*/
