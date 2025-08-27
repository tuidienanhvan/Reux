// src/stores/useChatStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useSocketStore } from "./useSocketStore";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  friends: [],
  strangers: [],
  messages: {}, // { conversationKey: [messages] }
  selectedUser: null,
  isFetchingFriends: false,
  isFetchingStrangers: false,
  isFetchingMessages: false,
  isSendingMessage: false,
  hasMoreFriends: true,
  hasMoreStrangers: true,

  resetChatStore: () =>
    set({
      friends: [],
      strangers: [],
      messages: {},
      selectedUser: null,
      isFetchingFriends: false,
      isFetchingStrangers: false,
      isFetchingMessages: false,
      isSendingMessage: false,
      hasMoreFriends: true,
      hasMoreStrangers: true,
      error: null,
    }),

  // chọn user để chat
  selectUser: (user) => {
    set({ selectedUser: user });
    if (user?._id) {
      get().fetchMessages(user._id);
    }
  },

  fetchFriends: async (skip = 0) => {
    set({ isFetchingFriends: true });
    try {
      const res = await axiosInstance.get(
        `/message/last-messages-friends?skip=${skip}`,
        { withCredentials: true }
      );
      set((state) => ({
        friends: skip === 0 ? res.data.data : [...state.friends, ...res.data.data],
        hasMoreFriends: res.data.hasMore,
      }));
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Server error" };
    } finally {
      set({ isFetchingFriends: false });
    }
  },

  fetchStrangers: async (skip = 0) => {
    set({ isFetchingStrangers: true });
    try {
      const res = await axiosInstance.get(
        `/message/last-messages-strangers?skip=${skip}`,
        { withCredentials: true }
      );
      set((state) => ({
        strangers: skip === 0 ? res.data.data : [...state.strangers, ...res.data.data],
        hasMoreStrangers: res.data.hasMore,
      }));
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Server error" };
    } finally {
      set({ isFetchingStrangers: false });
    }
  },

  fetchMessages: async (userId) => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) return;
    set({ isFetchingMessages: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`, { withCredentials: true });
      const conversationKey = [authUser._id, userId].sort().join("_");
      set((state) => ({
        messages: { ...state.messages, [conversationKey]: res.data },
      }));
    } catch (err) {
      console.error("fetchMessages error:", err);
    } finally {
      set({ isFetchingMessages: false });
    }
  },

  // ================================
// Gửi tin nhắn
// ================================
sendMessage: async (receiverID, payload) => {
  set({ isSendingMessage: true });
  try {
    const res = await axiosInstance.post(
      "/message",
      { receiverID, ...payload },   // merge payload thay vì { receiverID, content: payload }
      { withCredentials: true }
    );

    const authUser = useAuthStore.getState().authUser;
    const conversationKey = [authUser._id, receiverID].sort().join("_");

    set((state) => {
      const updatedMessages = {
        ...state.messages,
        [conversationKey]: [
          ...(state.messages[conversationKey] || []),
          res.data,
        ],
      };

      let updatedFriends = state.friends;
      let updatedStrangers = state.strangers;

      if (state.friends.some((f) => f.user._id === receiverID)) {
        updatedFriends = state.friends.map((f) =>
          f.user._id === receiverID ? { ...f, lastMessage: res.data } : f
        );
      } else if (state.strangers.some((s) => s.user._id === receiverID)) {
        updatedStrangers = state.strangers.map((s) =>
          s.user._id === receiverID ? { ...s, lastMessage: res.data } : s
        );
      }

      return {
        ...state,
        messages: updatedMessages,
        friends: updatedFriends,
        strangers: updatedStrangers,
      };
    });

    get().fetchStrangers();
    return { success: true, status: res.status, data: res.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Server error while sending message",
    };
  } finally {
    set({ isSendingMessage: false });
  }
},

  subscribeToMessages: () => {
    const { socket } = useSocketStore.getState();
    if (!socket) return;
    socket.off("receiveMessage");
    socket.on("receiveMessage", (message) => {
      get().receiveMessage(message);
    });
  },
}));
