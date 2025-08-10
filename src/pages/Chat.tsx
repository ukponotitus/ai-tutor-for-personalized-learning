import { ChatInterface } from "@/components/chat/chat-interface";
import DashboardLayout from "@/components/DashboardLayout";


const Chat = () => {
  return (
    <DashboardLayout>
      <div className="h-full w-full">
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
};

export default Chat;