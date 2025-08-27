const MessageSkeleton = () => {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-kurohe bg-base-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full bg-base-300 animate-pulse" />
            </div>
            <div className="chat-bubble bg-base-200 animate-pulse h-12 w-48 rounded-md" />
          </div>
        ))}
      </div>
    );
  };
  
  export default MessageSkeleton;