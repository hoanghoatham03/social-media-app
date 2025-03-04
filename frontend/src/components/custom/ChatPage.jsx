import ChatUserList from "./ChatUserList";
import ChatBox from "./ChatBox";
import StartChat from "./StartChat";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/context/SocketProvider";

const ChatPage = () => {
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { isStartChat } = useSelector((state) => state.conversation);

  useEffect(() => {
    // Update user's online status when entering the chat page
    if (socket && user) {
      socket.emit("user_connected", user._id);
    }

   
  }, [socket, user]);

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="w-1/4 border-r">
        <div className="p-4 border-b">
          <h2 className="font-bold text-xl">Messages</h2>
        </div>
        <div>
          <ChatUserList />
        </div>
      </div>
      <div className="w-3/4 p-4">
        {isStartChat ? <ChatBox /> : <StartChat />}
      </div>
    </div>
  );
};

export default ChatPage;
