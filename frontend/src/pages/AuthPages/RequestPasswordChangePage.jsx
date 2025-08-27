// src/pages/AuthPages/RequestPasswordChangePage.jsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { changePasswordSchema } from "../../validators/changePassword.schema.js";
import Notification from "../../components/Notification.jsx";

// Component trang yêu cầu đổi mật khẩu với UX và accessibility tối ưu
export default function RequestPasswordChangePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null); // { status: 'success' | 'error', message: string }

  const requestPasswordChange = useAuthStore((state) => state.requestPasswordChange);

  // Khởi tạo form với Zod schema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  // Tự động đóng thông báo sau 5 giây
  useEffect(() => {
    if (formStatus) {
      const timer = setTimeout(() => setFormStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  // Xử lý submit form
  const onSubmit = async (data) => {
    setIsLoading(true);
    setFormStatus(null); // Đặt lại trạng thái thông báo
    try {
      const result = await requestPasswordChange(data);
      if (result.success && result.status === 200) {
        setFormStatus({
          status: "success",
          message: result.message || "Password change confirmation email sent.",
        });
      } else {
        setFormStatus({
          status: "error",
          message: result.message || "Password change request failed.",
        });
      }
    } catch (err) {
      setFormStatus({
        status: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Server error during password change request. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">

      {/* Container form */}
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-md p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 z-10">
        <h2 className="text-3xl font-medium text-center mb-6 text-base-content font-texas">
          Request Password Change
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Trường Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                aria-label="Current Password"
                aria-invalid={errors.currentPassword ? "true" : "false"}
                aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                className="font-kurohe input input-bordered w-full pr-12 text-base-content bg-base-200
                  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                  transition-all duration-200 rounded-md"
                {...register("currentPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-content hover:text-primary transition-colors duration-200"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isLoading}
                aria-label="Toggle current password visibility"
              >
                {showCurrentPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p id="currentPassword-error" className="text-sm mt-1 text-error">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Trường New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
                aria-label="New Password"
                aria-invalid={errors.newPassword ? "true" : "false"}
                aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                className="font-kurohe input input-bordered w-full pr-12 text-base-content bg-base-200
                  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                  transition-all duration-200 rounded-md"
                {...register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-content hover:text-primary transition-colors duration-200"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
                aria-label="Toggle new password visibility"
              >
                {showNewPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {errors.newPassword && (
              <p id="newPassword-error" className="text-sm mt-1 text-error">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Nút Submit với spinner */}
          <button
            type="submit"
            className="w-full bg-primary text-primary-content font-texas py-2.5 px-4 rounded-md hover:bg-primary focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Requesting...
              </span>
            ) : (
              "Request Password Change"
            )}
          </button>
        </form>
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