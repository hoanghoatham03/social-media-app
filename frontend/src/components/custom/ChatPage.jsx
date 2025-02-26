import ChatUserList from "./ChatUserList";
import ChatBox from "./ChatBox";
import StartChat from "./StartChat";
import { useState } from "react";

const ChatPage = () => {
  const [isStartChat, setIsStartChat] = useState(false);

  return (
    <div className="flex h-screen w-full ">
      <div className="w-1/4">
        <div>author</div>
        <div>
          <ChatUserList />
        </div>
      </div>
      <div className="w-3/4">{isStartChat ? <ChatBox /> : <StartChat />}</div>
    </div>
  );
};

export default ChatPage;
