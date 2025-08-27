// src/components/ChatContainer.jsx
import { useEffect, useRef, useMemo } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages, fetchMessages, isFetchingMessages, selectedUser, subscribeToMessages } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const conversationKey = useMemo(() => {
    if (!selectedUser?._id || !authUser?._id) return null;
    return [authUser._id, selectedUser._id].sort().join("_");
  }, [selectedUser?._id, authUser?._id]);

  const currentMessages = useMemo(() => {
    if (!conversationKey) return [];
    return messages[conversationKey] || [];
  }, [conversationKey, messages]);

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
      subscribeToMessages();
    }
  }, [selectedUser?._id, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  if (isFetchingMessages) {
    return (
      <div className="flex-1 flex flex-col overflow-auto font-kurohe">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col overflow-auto font-kurohe">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center text-base-content/70">
          <p>No user selected</p>
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto font-kurohe">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
        {currentMessages.map((message) => {
          const isMine = message.senderUser._id === authUser._id;
          const sender = message.senderUser;
          return (
            <div key={message._id} className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border border-base-300">
                  <img src={sender?.avatarURL || "/avatar.png"} alt={sender?.username || "User"} />
                </div>
              </div>
              <div className="chat-header mb-1 text-base-content/70">
                <time className="text-xs font-kurohe">{formatMessageTime(message.createdAt)}</time>
              </div>
              <div className="chat-bubble flex flex-col bg-base-200 text-base-content">
                {message.mediaUrl && (
                  <img
                    src={message.mediaUrl}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.content && <p>{message.content}</p>}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
