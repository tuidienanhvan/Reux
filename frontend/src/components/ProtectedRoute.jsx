import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useAnimation } from '../contexts/AnimationContext';
import FullScreenLoader from './FullScreenLoader';

const ProtectedRoute = ({ children }) => {
  const { pathname, state } = useLocation();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { isExiting } = useAnimation();

  useEffect(() => {
    if (!authUser && !isCheckingAuth) {
      console.log('ProtectedRoute: Triggering checkAuth');
      checkAuth();
    }
  }, [authUser, isCheckingAuth, checkAuth]);

  console.log('ProtectedRoute:', { authUser: authUser ? { id: authUser._id, username: authUser.username } : null, isCheckingAuth, isExiting, pathname });

  if (isCheckingAuth) return <FullScreenLoader />;
  if (!authUser && !isExiting) return <Navigate to="/login" replace state={{ from: { pathname, state } }} />;

  return children;
};

export default ProtectedRoute;