import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useAnimation } from '../contexts/AnimationContext';
import FullScreenLoader from './FullScreenLoader';

const PublicRoute = ({ children }) => {
  const { pathname, state } = useLocation();
  const { authUser, isCheckingAuth } = useAuthStore();
  const { isExiting } = useAnimation();

  console.log('PublicRoute:', { authUser: authUser ? { id: authUser._id, username: authUser.username } : null, isCheckingAuth, isExiting, pathname });

  if (isCheckingAuth) return <FullScreenLoader />;
  if (authUser && !isExiting) return <Navigate to={state?.from?.pathname || '/'} replace state={{ from: state?.from }} />;

  return children;
};

export default PublicRoute;