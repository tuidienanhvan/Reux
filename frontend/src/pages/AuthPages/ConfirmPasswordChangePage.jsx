// src/pages/AuthPages/ConfirmPasswordChangePage.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore.js";
import Notification from "../../components/Notification.jsx";

// Component trang xác nhận đổi mật khẩu với UX và accessibility tối ưu
export default function ConfirmPasswordChangePage() {
  const [formStatus, setFormStatus] = useState(null); // { status: 'success' | 'error', message: string }
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const confirmPasswordChange = useAuthStore((state) => state.confirmPasswordChange);
  const hasRun = useRef(false);

  // Xử lý xác nhận đổi mật khẩu khi trang tải
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setFormStatus({
        status: "error",
        message: "Invalid or missing password change token.",
      });
      setIsLoading(false);
      return;
    }

    // Gọi API xác nhận đổi mật khẩu
    const confirm = async () => {
      try {
        const result = await confirmPasswordChange(token);
        if (result.success && result.status === 200) {
          setFormStatus({
            status: "success",
            message: result.message || "Password changed successfully.",
          });
          setTimeout(() => window.location.href = "/login", 2000); // Chuyển hướng về trang đăng nhập
        } else {
          setFormStatus({
            status: "error",
            message: result.message || "Password change confirmation failed.",
          });
        }
      } catch (err) {
        setFormStatus({
          status: "error",
          message:
            err.response?.data?.message ||
            err.message ||
            "Server error during password change confirmation. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    confirm();
  }, [searchParams, confirmPasswordChange]);

  // Tự động đóng thông báo sau 5 giây
  useEffect(() => {
    if (formStatus) {
      const timer = setTimeout(() => setFormStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">

      {/* Container nội dung */}
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-md p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 z-10">
        <h2 className="text-3xl font-medium text-center mb-6 text-base-content font-texas">
          Confirm Password Change
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="ml-2 text-base-content font-texas">Confirming...</span>
          </div>
        ) : (
          <p className="text-center text-base-content font-texas">
            {formStatus ? formStatus.message : "Processing password change confirmation..."}
          </p>
        )}
      </div>

      {/* Thông báo trạng thái */}
      <Notification
        status={formStatus?.status}
        message={formStatus?.message}
        onClose={() => setFormStatus(null)}
      />
    </div>
  );
}