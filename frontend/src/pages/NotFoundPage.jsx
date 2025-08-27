import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

/* Trang lỗi 404 (màu sắc & UX đồng bộ với LoginPage) */
export default function NotFoundPage() {
  const authUser = useAuthStore((state) => state.authUser);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg bg-base-100 rounded-xl shadow-md p-6 sm:p-8 md:p-10 hover:shadow-lg transition-all duration-300">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-error font-texas mb-2 leading-none">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-texas text-base-content mb-4 text-center">
          Page not found
        </h2>

        <p className="text-base sm:text-lg text-secondary-content font-kurohe mb-8 text-center">
          Sorry, the page you are looking for does not exist or may have been moved. Please return to the home page or try signing in.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn btn-primary text-primary-content font-texas px-6
                       focus-visible:ring-2 focus-visible:ring-accent
                       focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            aria-label="Back to Home"
          >
            Back to Home
          </Link>

          {!authUser && (
            <Link
              to="/login"
              className="btn btn-outline btn-primary font-texas px-6
                         focus-visible:ring-2 focus-visible:ring-accent
                         focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
              aria-label="Sign In"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}