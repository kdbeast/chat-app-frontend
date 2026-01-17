import { Outlet } from "react-router";
import AppWrapper from "@/components/AppWrapper";
import ChatList from "@/components/chat/ChatList";

const AppLayout = () => {
  return (
    <AppWrapper>
      <div className="h-full">
        <div className="block">
          <ChatList />
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
