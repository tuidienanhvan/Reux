import { useEffect } from 'react';

export default function Notification({ status, message, onClose }) {
  // Quản lý thời gian hiển thị thông báo
  useEffect(() => {
    if (status && message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, message, onClose]); // Phụ thuộc vào status, message, onClose

  // Không render nếu không có status hoặc message
  if (!status || !message) return null;

  return (
    <div
      className={`fixed top-5 right-5 sm:w-72 p-4 rounded-md shadow-lg z-50
        ${status === "success" ? "bg-success text-success-content" : "bg-error text-error-content"}`}
    >
      <div className="flex justify-between items-start">
        <span className="font-texas">
          {status === "success" ? "Success!" : "Error!"}
        </span>
        <button
          className="ml-2 text-xl font-bold leading-none"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}