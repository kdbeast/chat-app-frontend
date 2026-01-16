import AppRoutes from "./routes";
import { useEffect } from "react";
import Logo from "./components/logo";
import { useAuth } from "./hooks/useAuth";
import { useLocation } from "react-router";
import { isAuthRoute } from "./routes/routes";
import { useSocket } from "./hooks/useSocket";
import { Spinner } from "./components/ui/spinner";

export function App() {
  const { pathname } = useLocation();
  const { onlineUsers } = useSocket();
  const { user, isAuthStatus, isAuthStatusLoading } = useAuth();

  console.log("Online users", onlineUsers);

  const isAuth = isAuthRoute(pathname);

  useEffect(() => {
    isAuthStatus();
  }, [isAuthStatus]);

  if (isAuthStatusLoading && !user && isAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Logo imgClass="size-20" showText={false} />
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
