import { MessageSquare } from "lucide-react";

const StartChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <MessageSquare className="h-12 w-12 text-gray-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Your Messages</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        Send private messages to your friends and connections. Select a
        conversation from the sidebar or start a new one.
      </p>
      <div className="text-sm text-gray-400">
        <p>👈 Select a user from the list to start chatting</p>
      </div>
    </div>
  );
};

export default StartChat;
