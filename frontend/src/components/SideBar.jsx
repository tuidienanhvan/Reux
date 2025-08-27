// src/components/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useSocketStore } from "../stores/useSocketStore";
import { useAuthStore } from "../stores/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const {
    friends,
    strangers,
    selectedUser,
    selectUser,
    fetchFriends,
    fetchStrangers,
    isFetchingFriends,
    isFetchingStrangers,
  } = useChatStore();
  const { onlineFriends, onlineStrangers } = useSocketStore();
  const { authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    fetchFriends();
    fetchStrangers();
  }, [fetchFriends, fetchStrangers]);

  const displayedUsers = useMemo(() => {
    const users = activeTab === "friends" ? friends : strangers;
    const sortedUsers = users.sort((a, b) => {
      const ta = a.lastMessageInfo?.createdAt
        ? new Date(a.lastMessageInfo.createdAt).getTime()
        : 0;
      const tb = b.lastMessageInfo?.createdAt
        ? new Date(b.lastMessageInfo.createdAt).getTime()
        : 0;
      return tb - ta;
    });
    return showOnlineOnly
      ? sortedUsers.filter((item) =>
          activeTab === "friends"
            ? onlineFriends.includes(item.user._id.toString())
            : onlineStrangers.some(
                (s) => s.user._id.toString() === item.user._id.toString()
              )
        )
      : sortedUsers;
  }, [friends, strangers, activeTab, showOnlineOnly, onlineFriends, onlineStrangers]);

  if (isFetchingFriends || isFetchingStrangers) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="h-full w-full border-r border-accent bg-secondary flex flex-col font-kurohe transition-all duration-200">
      {/* Header */}
      <div className="border-b border-accent w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary-content" />
          <span className="font-kurohe font-medium hidden lg:block text-primary-content">
            Contacts
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-2 py-1 text-sm font-kurohe rounded 
              ${activeTab === "friends" 
                ? "bg-primary text-primary-content" 
                : "bg-base-200 text-base-content"}`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab("strangers")}
            className={`px-2 py-1 text-sm font-kurohe rounded 
              ${activeTab === "strangers" 
                ? "bg-primary text-primary-content" 
                : "bg-base-200 text-base-content"}`}
          >
            Strangers
          </button>
        </div>
        <br />
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="checkbox checkbox-sm border-base-content text-base-200 bg-accent"
          />
          <span className="text-sm text-base-100 hidden lg:inline">
            Online only
          </span>
        </label>
        <span className="text-xs text-base-300 hidden lg:inline">
          ({activeTab === "friends" ? onlineFriends.length : onlineStrangers.length} online)
        </span>
      </div>

      {/* Danh sách user */}
      <div className="overflow-y-auto w-full py-3">
        {displayedUsers.map((item) => {
          const isOnline =
            activeTab === "friends"
              ? onlineFriends.includes(item.user._id.toString())
              : onlineStrangers.some((s) => s.user._id.toString() === item.user._id.toString());

          const displayName =
            [item.user.firstName, item.user.lastName].filter(Boolean).join(" ") ||
            item.user.username ||
            "Unknown";

          let lastMessageText = "";
          if (item.lastMessageInfo) {
            const isOwnMessage = item.lastMessageInfo.senderUser?._id === authUser?._id;
            const senderName = isOwnMessage ? "You" : displayName;
            if (item.lastMessageInfo.mediaUrl) {
              lastMessageText = `${senderName} sent a file`;
            } else if (item.lastMessageInfo.content) {
              lastMessageText = `${senderName}: ${item.lastMessageInfo.content}`;
            }
          }

          return (
            <button
              key={item.user._id}
              onClick={() => selectUser(item.user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-primary hover:text-white bg-accent-content transition-colors 
                ${selectedUser?._id === item.user._id ? "bg-base-300 text-primary ring-1 ring-base-300" : ""}`}
            >
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={item.user.avatarURL || "/avatar.png"}
                  alt={displayName}
                  className="size-12 object-cover rounded-full border border-black"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100" />
                )}
              </div>

              {/* Info */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-kurohe font-medium truncate">
                  {displayName}
                </div>
                <div className="text-sm font-kurohe">
                  {isOnline ? "Online" : "Offline"}
                </div>
                {item.lastMessageInfo && (
                  <div className="text-xs truncate">{lastMessageText}</div>
                )}
              </div>
            </button>
          );
        })}
        {displayedUsers.length === 0 && (
          <div className="text-center text-base-content/50 font-kurohe py-4">
            {activeTab === "friends" ? "No friends available" : "No strangers available"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
