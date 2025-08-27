// src/pages/ConversationPages/MessagePage.jsx

import Sidebar from "../../components/SideBar.jsx";
import NoChatSelected from "../../components/NoChatSelected.jsx";
import ChatContainer from "../../components/ChatContainer.jsx";
import { useChatStore } from "../../stores/useChatStore";

const MessagePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-screen flex font-kurohe">
      {/* Sidebar trái: nhỏ trên mobile, rộng hơn trên desktop */}
      <div className="w-20 lg:w-80">
        <Sidebar />
      </div>

      {/* Phần chat: luôn chiếm hết phần còn lại */}
      <div className="flex-1 flex flex-col bg-base-100">
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default MessagePage;
