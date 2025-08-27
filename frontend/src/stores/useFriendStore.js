// src/stores/useFriendStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useFriendStore = create((set) => ({
  friends: [],
  strangers: [],
  isLoading: false,
  isFriendsLoading: false,
  isStrangersLoading: false,
  hasMoreFriends: true,
  hasMoreStrangers: true,
  error: null,

  // ======================
  // Lấy danh sách bạn bè
  // ======================
  getFriends: async ({ skip = 0, reset = false } = {}) => {
    set({ isFriendsLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/friend/friends?skip=${skip}`, {
        withCredentials: true,
      });

      const newFriends = res.data.data;
      set((state) => {
        const existingIds = new Set(state.friends.map((f) => f._id.toString()));
        const filtered = newFriends.filter(
          (f) => !existingIds.has(f._id.toString())
        );
        const updated = reset ? newFriends : [...state.friends, ...filtered];

        return {
          friends: updated,
          isFriendsLoading: false,
          hasMoreFriends: res.data.hasMore,
        };
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi lấy bạn bè";
      console.error("getFriends error:", msg);
      set({ isFriendsLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  // ======================
  // Lấy danh sách người lạ
  // ======================
  getStrangers: async ({ skip = 0, reset = false } = {}) => {
    set({ isStrangersLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/friend/strangers?skip=${skip}`, {
        withCredentials: true,
      });

      const newStrangers = res.data.data;
      set((state) => {
        const existingIds = new Set(
          state.strangers.map((s) => s._id.toString())
        );
        const filtered = newStrangers.filter(
          (s) => !existingIds.has(s._id.toString())
        );
        const updated = reset ? newStrangers : [...state.strangers, ...filtered];

        return {
          strangers: updated,
          isStrangersLoading: false,
          hasMoreStrangers: res.data.hasMore,
        };
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi lấy người lạ";
      console.error("getStrangers error:", msg);
      set({ isStrangersLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  // ======================
  // Gửi lời mời kết bạn
  // ======================
  sendFriendRequest: async (toUserId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post(
        "/friend/send",
        { toUserId },
        { withCredentials: true }
      );
      return { success: true, data: res.data };
    } catch (err) {
      const msg =
        err.response?.data?.message || "Lỗi khi gửi lời mời kết bạn";
      console.error("sendFriendRequest error:", msg);
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  // ======================
  // Chấp nhận lời mời kết bạn
  // ======================
  acceptFriendRequest: async (fromUserId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post(
        "/friend/accept",
        { fromUserId },
        { withCredentials: true }
      );
      return { success: true, data: res.data };
    } catch (err) {
      const msg =
        err.response?.data?.message || "Lỗi khi chấp nhận lời mời kết bạn";
      console.error("acceptFriendRequest error:", msg);
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  // ======================
  // Hủy kết bạn
  // ======================
  removeFriend: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post(
        "/friend/remove",
        { userId },
        { withCredentials: true }
      );
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi hủy kết bạn";
      console.error("removeFriend error:", msg);
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ isLoading: false });
    }
  },
}));
