// src/components/ChatHeader.jsx
import { X } from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useSocketStore } from '../stores/useSocketStore';

const ChatHeader = () => {
  const { selectedUser, selectUser } = useChatStore();
  const { onlineFriends, onlineStrangers } = useSocketStore();

  if (!selectedUser) {
    return (
      <div className="p-5 border-b border-base-300 bg-primary font-kurohe">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src="/avatar.png" alt="Unknown" />
              </div>
            </div>
            <div>
              <h3 className="font-kurohe font-medium text-base-content">Unknown User</h3>
              <p className="text-sm font-kurohe text-base-content/70">Offline</p>
            </div>
          </div>
          <button
            onClick={() => selectUser(null)}
            className="btn btn-circle btn-sm bg-base-300 hover:bg-base-200 text-base-content border-none"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  const isOnline =
    onlineFriends.includes(selectedUser._id?.toString()) ||
    onlineStrangers.some((s) => s.user._id.toString() === selectedUser._id?.toString());

  const fullName = `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim();

  return (
    <div className="p-5 border-b border-base-300 bg-primary font-kurohe">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full border-black border-1 relative">
              <img src={selectedUser.avatarURL || "/avatar.png"} alt={fullName || 'User'} />
            </div>
          </div>
          <div>
            <h3 className="font-kurohe font-medium text-base-200">
              {fullName || selectedUser.username}
            </h3>
            <p className="text-sm font-kurohe text-base-100">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={() => selectUser(null)}
          className="btn btn-circle btn-sm bg-base-300 hover:bg-base-200 text-base-content border-none"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
