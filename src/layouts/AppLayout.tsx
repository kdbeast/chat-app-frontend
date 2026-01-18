import { Outlet } from "react-router";
import AppWrapper from "@/components/AppWrapper";
import ChatList from "@/components/chat/ChatList";
import { cn } from "@/lib/utils";

const AppLayout = () => {
  return (
    <AppWrapper>
      <div className="h-full">
        <div className="block">
          <ChatList />
        </div>
        <div className={cn("lg:pl-95! pl-7")}>
          <Outlet />
        </div>
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
