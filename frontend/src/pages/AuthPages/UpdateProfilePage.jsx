// src/pages/AuthPages/UpdateProfilePage.jsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../stores/useAuthStore.js";
import { updateProfileSchema } from "../../validators/profile.schema.js";
import Notification from "../../components/Notification.jsx";

// Component trang cập nhật hồ sơ với UX và accessibility tối ưu
export default function UpdateProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null); // { status: 'success' | 'error', message: string }

  const updateProfile = useAuthStore((state) => state.updateProfile);

  // Khởi tạo form với Zod schema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
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
      const result = await updateProfile(data);
      if (result.success && result.status === 200) {
        setFormStatus({
          status: "success",
          message: result.message || "Profile updated successfully.",
        });
      } else {
        setFormStatus({
          status: "error",
          message: result.message || "Profile update failed.",
        });
      }
    } catch (err) {
      setFormStatus({
        status: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Server error during profile update. Please try again later.",
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
          Update Your Profile
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Trường Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Username
            </label>
            <input
              id="username"
              placeholder="Enter your username"
              aria-label="Username"
              aria-invalid={errors.username ? "true" : "false"}
              aria-describedby={errors.username ? "username-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("username")}
            />
            {errors.username && (
              <p id="username-error" className="text-sm mt-1 text-error">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Trường First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              First Name
            </label>
            <input
              id="firstName"
              placeholder="Enter your first name"
              aria-label="First Name"
              aria-invalid={errors.firstName ? "true" : "false"}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-sm mt-1 text-error">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Trường Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Last Name
            </label>
            <input
              id="lastName"
              placeholder="Enter your last name"
              aria-label="Last Name"
              aria-invalid={errors.lastName ? "true" : "false"}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p id="lastName-error" className="text-sm mt-1 text-error">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Trường Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Gender
            </label>
            <select
              id="gender"
              aria-label="Gender"
              aria-invalid={errors.gender ? "true" : "false"}
              aria-describedby={errors.gender ? "gender-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("gender")}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p id="gender-error" className="text-sm mt-1 text-error">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Trường Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              aria-label="Date of Birth"
              aria-invalid={errors.dateOfBirth ? "true" : "false"}
              aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p id="dateOfBirth-error" className="text-sm mt-1 text-error">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          {/* Trường Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself"
              aria-label="Bio"
              aria-invalid={errors.bio ? "true" : "false"}
              aria-describedby={errors.bio ? "bio-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("bio")}
            />
            {errors.bio && (
              <p id="bio-error" className="text-sm mt-1 text-error">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Trường Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-secondary-content mb-1 font-texas">
              Location
            </label>
            <input
              id="location"
              placeholder="Enter your location"
              aria-label="Location"
              aria-invalid={errors.location ? "true" : "false"}
              aria-describedby={errors.location ? "location-error" : undefined}
              className="font-kurohe input input-bordered w-full text-base-content bg-base-200
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base-100
                transition-all duration-200 rounded-md"
              {...register("location")}
            />
            {errors.location && (
              <p id="location-error" className="text-sm mt-1 text-error">
                {errors.location.message}
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
                Updating...
              </span>
            ) : (
              "Update Profile"
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