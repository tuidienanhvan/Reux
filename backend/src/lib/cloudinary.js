// src/lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Ký các tham số upload mà FE sẽ gửi lên Cloudinary.
 * LƯU Ý: KHÔNG ký 'file', 'cloud_name', 'resource_type', 'api_key'.
 * Ví dụ phổ biến cần ký: timestamp, folder, public_id, eager, tags...
 */
export const generateUploadSignature = (paramsToSign = {}) => {
  // luôn có timestamp
  const timestamp = Math.round(Date.now() / 1000);

  // gom các param cần ký
  const toSign = { timestamp, ...paramsToSign }; // vd: { timestamp, folder, public_id }

  const signature = cloudinary.utils.api_sign_request(
    toSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    cloudName:  process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:     process.env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    // trả lại luôn các param đã ký để FE dùng lại đúng y chang
    ...paramsToSign,
  };
};

export default cloudinary;
