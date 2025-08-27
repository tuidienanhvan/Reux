import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { useSocketStore } from './useSocketStore';
import { useChatStore } from './useChatStore';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: false,
  isLoggingIn: false,
  isRegistering: false,
  isLoggingOut: false,
  isVerifyingEmail: false,
  isUnlockingAccount: false,
  isRequestingPasswordChange: false,
  isConfirmingPasswordChange: false,
  isUpdatingProfile: false,
  isRequestingForgotPassword: false,

  checkAuth: async () => {
    if (get().isCheckingAuth) return;
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get('/auth/check-auth', { withCredentials: true });
      const user = res.data;
      set({ authUser: user, isCheckingAuth: false });
      return { success: true, status: res.status, user };
    } catch (error) {
      console.error('checkAuth error:', error.response?.data || error.message);
      set({ authUser: null, isCheckingAuth: false });
      useSocketStore.getState().disconnect();
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Auth check failed',
      };
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', formData, { withCredentials: true });
      const user = res.data.user;
      set({ authUser: user });
      return {
        success: true,
        status: res.status,
        message: res.data.message || 'Login successful',
        user,
      };
    } catch (error) {
      set({ isLoggingIn: false });
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      const res = await axiosInstance.get('/auth/logout', { withCredentials: true });
      set({ authUser: null, isLoggingOut: false });
      useSocketStore.getState().disconnect();
      useChatStore.getState().resetChatStore();
      return {
        success: true,
        status: res.status,
        message: res.data.message || 'Logout successful',
      };
    } catch (error) {
      set({ isLoggingOut: false });
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Logout failed',
      };
    }
  },

  register: async (formData) => {
    set({ isRegistering: true });
    try {
      const res = await axiosInstance.post('/auth/register', formData, { withCredentials: true });
      return {
        success: true,
        status: res.status,
        message: res.data.message || 'Registration successful. Please verify your email.',
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      set({ isRegistering: false });
    }
  },

  verifyEmail: async (token) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.get(`/auth/verify-email?token=${token}`, { withCredentials: true });
      return { success: true, status: res.status, message: res.data.message };
    } catch (error) {
      return { success: false, status: error.response?.status || 500, message: error.response?.data?.message };
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  unlockAccount: async (token) => {
    set({ isUnlockingAccount: true });
    try {
      const res = await axiosInstance.get(`/auth/unlock-account?token=${token}`, { withCredentials: true });
      return { success: true, status: res.status, message: res.data.message };
    } catch (error) {
      return { success: false, status: error.response?.status || 500, message: error.response?.data?.message };
    } finally {
      set({ isUnlockingAccount: false });
    }
  },

  requestPasswordChange: async (formData) => {
    set({ isRequestingPasswordChange: true });
    try {
      const res = await axiosInstance.post('/auth/request-password-change', formData, { withCredentials: true });
      return { success: true, status: res.status, message: res.data.message };
    } catch (error) {
      return { success: false, status: error.response?.status || 500, message: error.response?.data?.message };
    } finally {
      set({ isRequestingPasswordChange: false });
    }
  },

  forgotPassword: async (formData) => {
    set({ isRequestingForgotPassword: true });
    try {
      const res = await axiosInstance.post('/auth/forgot-password', formData, { withCredentials: true });
      return { success: true, status: res.status, message: res.data.message };
    } catch (error) {
      return { success: false, status: error.response?.status || 500, message: error.response?.data?.message };
    } finally {
      set({ isRequestingForgotPassword: false });
    }
  },

  confirmPasswordChange: async (token) => {
    set({ isConfirmingPasswordChange: true });
    try {
      const res = await axiosInstance.get(`/auth/confirm-password-change?token=${token}`, { withCredentials: true });
      return { success: true, status: res.status, message: res.data.message };
    } catch (error) {
      return { success: false, status: error.response?.status || 500, message: error.response?.data?.message };
    } finally {
      set({ isConfirmingPasswordChange: false });
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.patch('/auth/update-profile', formData, { withCredentials: true });
      set({ authUser: res.data.user, isUpdatingProfile: false });
      return { success: true, status: res.status, message: res.data.message, user: res.data.user };
    } catch (error) {
      set({ isUpdatingProfile: false });
      return { success: false, status: error.response?.status || 500, message: error.response?.data?.message };
    }
  },

  getUser: async (userId) => {
    try {
      const res = await axiosInstance.get(`/auth/${userId}`, { withCredentials: true });
      return {
        success: true,
        status: res.status,
        user: res.data,
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch user',
      };
    }
  },
}));