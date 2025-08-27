// src/components/MessageInput.jsx
import { useRef, useState } from "react";
import { useChatStore } from "../stores/useChatStore";
import { axiosInstance } from "../lib/axios";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();

  // ==========================
  // Chọn ảnh
  // ==========================
  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (!selected?.type.startsWith("image/")) {
      toast.error("Please select an image file", {
        style: { background: "#3E3F29", color: "#F1F0E4" },
      });
      return;
    }
    setFile(selected);
    setImagePreview(URL.createObjectURL(selected)); // preview tạm
  };

  // ==========================
  // Xóa ảnh
  // ==========================
  const removeImage = () => {
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ==========================
  // Upload ảnh trực tiếp lên Cloudinary
  // ==========================
  const uploadToCloudinary = async (file) => {
    try {
      const { data: sig } = await axiosInstance.get(
        "/cloudinary/upload-signature"
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", sig.timestamp);
      formData.append("signature", sig.signature);
      formData.append("folder", "chat-app");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      const result = await uploadRes.json();
      if (result.secure_url) return result.secure_url;
      throw new Error("Upload failed");
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  // ==========================
  // Gửi tin nhắn
  // ==========================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    if (!selectedUser?._id) {
      toast.error("No user selected", {
        style: { background: "#3E3F29", color: "#F1F0E4" },
      });
      return;
    }

    try {
      let mediaUrl = null;
      if (file) {
        setIsUploading(true);
        mediaUrl = await uploadToCloudinary(file);
        setIsUploading(false);
      }

      const payload = mediaUrl
        ? { type: "image", content: text.trim(), mediaUrl }
        : { type: "text", content: text.trim() };

      await sendMessage(selectedUser._id, payload);

      // Reset form
      setText("");
      setFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Failed to send message", {
        style: { background: "#3E3F29", color: "#F1F0E4" },
      });
      setIsUploading(false);
    }
  };

  // ==========================
  // UI
  // ==========================
  return (
    <div className="p-5 w-full font-kurohe border-t border-primary bg-base-300 sticky bottom-0">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-md border border-accent"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center shadow"
              type="button"
            >
              <X className="size-4 text-base-content" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 min-h-[72px]"
      >
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input rounded-md font-kurohe input-lg"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!selectedUser?._id || isUploading}
          />

          {/* input file ẩn */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={!selectedUser?._id || isUploading}
          />

          {/* Nút chọn ảnh */}
          <button
            type="button"
            className={`btn btn-circle btn-lg ${
              imagePreview ? "text-success" : "text-base-content/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedUser?._id || isUploading}
          >
            <Image size={24} />
          </button>
        </div>

        {/* Nút gửi */}
        <button
          type="submit"
          className="btn btn-circle btn-lg bg-primary text-primary-content"
          disabled={(!text.trim() && !file) || !selectedUser?._id || isUploading}
        >
          {isUploading ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <Send size={26} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
