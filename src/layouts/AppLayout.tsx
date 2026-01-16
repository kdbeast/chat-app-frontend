import { Outlet } from "react-router";
import AppWrapper from "@/components/AppWrapper";

const AppLayout = () => {
  return (
    <AppWrapper>
      <div className="h-full">
        <Outlet />
      </div>
    </AppWrapper>
  );
};

export default AppLayout;
