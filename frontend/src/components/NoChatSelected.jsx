import { MessageSquare } from 'lucide-react';
import logo from "../assets/logo.svg";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="text-center space-y-6">
        <img
              src={logo}
              alt="Reux Logo"
              className="w-60 h-60 sm:w-30 sm:h-30 lg:w-68 lg:h-68 mx-auto mb-4 drop-shadow-lg animate-bounce"
            />
        <h2 className="text-5xl font-texas font-bold text-primary">Welcome to Reux</h2>
        <p className="text-base-content/60 font-kurohe text-3xl">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;