import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import FullScreenLoader from './components/FullScreenLoader';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { useSocketStore } from './stores/useSocketStore';
import { useAuthStore } from './stores/useAuthStore';
import background1 from './assets/background1.svg';
import { AnimationProvider } from './contexts/AnimationContext';

// Hàm lazy load với preload và xử lý lỗi
const lazyLoadPage = (path, pageName, importFn) => {
  const Component = lazy(() =>
    importFn().catch((error) => {
      console.error(`Failed to load ${pageName}:`, error);
      return { default: () => <div>Error loading ${pageName}</div> };
    })
  );
  Component.preload = () =>
    importFn().catch((error) => console.error(`Preload ${pageName} failed:`, error));
  return Component;
};

// Danh sách các trang với import tĩnh
const pages = [
  { path: 'HomePage', name: 'Home Page', importFn: () => import('./pages/HomePage.jsx') },
  { path: 'AuthPages/LoginPage', name: 'Login Page', importFn: () => import('./pages/AuthPages/LoginPage.jsx') },
  { path: 'AuthPages/RegisterPage', name: 'Register Page', importFn: () => import('./pages/AuthPages/RegisterPage.jsx') },
  { path: 'AuthPages/VerifyEmailPage', name: 'Verify Email Page', importFn: () => import('./pages/AuthPages/VerifyEmailPage.jsx') },
  { path: 'AuthPages/UnlockAccountPage', name: 'Unlock Account Page', importFn: () => import('./pages/AuthPages/UnlockAccountPage.jsx') },
  { path: 'AuthPages/RequestPasswordChangePage', name: 'Request Password Change Page', importFn: () => import('./pages/AuthPages/RequestPasswordChangePage.jsx') },
  { path: 'AuthPages/ForgotPasswordPage', name: 'Forgot Password Page', importFn: () => import('./pages/AuthPages/ForgotPasswordPage.jsx') },
  { path: 'AuthPages/ConfirmPasswordChangePage', name: 'Confirm Password Change Page', importFn: () => import('./pages/AuthPages/ConfirmPasswordChangePage.jsx') },
  { path: 'AuthPages/UpdateProfilePage', name: 'Update Profile Page', importFn: () => import('./pages/AuthPages/UpdateProfilePage.jsx') },
  { path: 'NotFoundPage', name: 'Not Found Page', importFn: () => import('./pages/NotFoundPage.jsx') },
  { path: 'ConversationPages/MessagePage', name: 'Message Page', importFn: () => import('./pages/ConversationPages/MessagePage.jsx') },
];

// Tạo các trang lazy
const pageComponents = pages.reduce((acc, { path, name, importFn }) => {
  acc[path.replace('/', '_')] = lazyLoadPage(path, name, importFn);
  return acc;
}, {});

const HomePage = pageComponents['HomePage'];
const LoginPage = pageComponents['AuthPages_LoginPage'];
const RegisterPage = pageComponents['AuthPages_RegisterPage'];
const VerifyEmailPage = pageComponents['AuthPages_VerifyEmailPage'];
const UnlockAccountPage = pageComponents['AuthPages_UnlockAccountPage'];
const RequestPasswordChangePage = pageComponents['AuthPages_RequestPasswordChangePage'];
const ConfirmPasswordChangePage = pageComponents['AuthPages_ConfirmPasswordChangePage'];
const UpdateProfilePage = pageComponents['AuthPages_UpdateProfilePage'];
const NotFoundPage = pageComponents['NotFoundPage'];
const MessagePage = pageComponents['ConversationPages_MessagePage'];
const ForgotPasswordPage = pageComponents['AuthPages_ForgotPasswordPage'];

const App = () => {
  const bgRef = useRef(null);
  const isMounted = useRef(true);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const authUserId = useAuthStore((state) => state.authUser?._id);
  const connect = useSocketStore((state) => state.connect);

  // Kiểm tra xác thực một lần khi mount
  useEffect(() => {
    if (!isMounted.current) return;
    console.log('Starting auth check...');
    checkAuth();
    return () => {
      isMounted.current = false;
    };
  }, [checkAuth]);

  // Kết nối socket khi authUser tồn tại
  useEffect(() => {
    if (authUserId && !isCheckingAuth) {
      console.log('Initiating Socket.IO connection for user:', authUserId);
      connect(authUserId);
    }
  }, [authUserId, isCheckingAuth, connect]);

  // Preload các trang khi xác thực hoàn tất
  useEffect(() => {
    if (!isCheckingAuth) {
      console.log('Preloading pages...');
      Promise.all([
        HomePage.preload(),
        LoginPage.preload(),
        RegisterPage.preload(),
        MessagePage.preload(),
      ])
        .then(() => console.log('Preload completed'))
        .catch((error) => console.error('Preload failed:', error));
    }
  }, [isCheckingAuth]);

  // Hiển thị loader khi đang kiểm tra xác thực
  if (isCheckingAuth) {
    console.log('Showing FullScreenLoader due to isCheckingAuth:', isCheckingAuth);
    return <FullScreenLoader />;
  }

  return (
    <AnimationProvider>
      <div className="relative min-h-screen">
        <picture>
          <source srcSet={background1} type="image/svg+xml" />
          <img
            ref={bgRef}
            src={background1}
            alt="Background"
            className="absolute inset-0 object-cover w-full h-full"
            loading="eager"
            decoding="async"
            as="image"
          />
        </picture>
        <div className="absolute inset-0 bg-neutral/60 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <Suspense
            fallback={<FullScreenLoader timeout={5000} timeoutMessage="Error loading page. Please refresh." />}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <VerifyEmailPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/unlock-account"
                element={
                  <PublicRoute>
                    <UnlockAccountPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/request-password-change"
                element={
                  <PublicRoute>
                    <RequestPasswordChangePage />
                  </PublicRoute>
                }
              />
               <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/confirm-password-change"
                element={
                  <PublicRoute>
                    <ConfirmPasswordChangePage />
                  </PublicRoute>
                }
              />
              <Route
                path="/update-profile"
                element={
                  <ProtectedRoute>
                    <UpdateProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/message"
                element={
                  <ProtectedRoute>
                    <MessagePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </AnimationProvider>
  );
};

export default React.memo(App);
