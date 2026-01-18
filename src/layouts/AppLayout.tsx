import { cn } from "@/lib/utils";
import { Outlet } from "react-router";
import useChatId from "@/hooks/useChatId";
import AppWrapper from "@/components/AppWrapper";
import ChatList from "@/components/chat/ChatList";

const AppLayout = () => {
  const chatId = useChatId();
  return (
    <AppWrapper>
      <div className="h-full">
        <div className={cn(chatId ? "hidden lg:block" : "block")}>
          <ChatList />
        </div>
        <div
          className={cn(
            "lg:pl-95! pl-7",
            !chatId ? "hidden lg:block" : "block",
          )}
        >
          <Outlet />
        </div>
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
