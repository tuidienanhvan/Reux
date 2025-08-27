// src/stores/useSocketStore.js
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';

// URL server Socket.IO
const SOCKET_URL = 'http://localhost:5001';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineFriends: [],
  onlineStrangers: [],
  userOnlineStatus: {},

  // =========================
  // Kết nối socket
  // =========================
  connect: (userId) => {
    const authUser = userId || useAuthStore.getState().authUser?._id;
    if (!authUser) {
      console.error('connect: No authenticated user found');
      return;
    }

    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) {
      console.log('Socket already connected, skip new connection');
      return;
    }

    const newSocket = io(SOCKET_URL, {
      query: { userId: authUser },
      withCredentials: true,
    });

    // Sự kiện connect
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      set({ socket: newSocket });
    });

    // Danh sách bạn bè online
    newSocket.on('getOnlineFriends', (friendIds) => {
      console.log('Received online friends:', friendIds);
      set({ onlineFriends: friendIds });
    });

    // Danh sách người lạ online
    newSocket.on('getOnlineStrangers', (strangers) => {
      console.log('Received online strangers:', strangers);
      set({ onlineStrangers: strangers });
    });

    // Trạng thái online của user cụ thể
    newSocket.on('getUserOnlineStatus', ({ userId, isOnline }) => {
      console.log(`Received online status for user ${userId}:`, isOnline);
      set((state) => ({
        userOnlineStatus: {
          ...state.userOnlineStatus,
          [userId]: isOnline,
        },
      }));
    });

    // Lỗi connect
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Disconnect
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({
        socket: null,
        onlineFriends: [],
        onlineStrangers: [],
        userOnlineStatus: {},
      });
    });
  },

  // =========================
  // Ngắt kết nối
  // =========================
  disconnect: () => {
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.disconnect();
      console.log('Socket manually disconnected');
    }
    set({
      socket: null,
      onlineFriends: [],
      onlineStrangers: [],
      userOnlineStatus: {},
    });
  },

  // =========================
  // Check online 1 user
  // =========================
  checkUserOnline: (userId) => {
    const socket = get().socket;
    if (!socket) {
      console.error('checkUserOnline: No socket connection');
      return;
    }
    socket.emit('checkUserOnline', userId);
  },
}));
