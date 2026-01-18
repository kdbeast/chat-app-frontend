import AppRoutes from "./routes";
import { useEffect } from "react";
import Logo from "./components/logo";
import { useAuth } from "./hooks/useAuth";
import { useLocation } from "react-router";
import { isAuthRoute } from "./routes/routes";
import { Spinner } from "./components/ui/spinner";

export function App() {
  const { pathname } = useLocation();
  const { user, isAuthStatus, isAuthStatusLoading } = useAuth();

  const isAuth = isAuthRoute(pathname);

  useEffect(() => {
    if (isAuth) return;
    isAuthStatus();
  }, [isAuthStatus, isAuth]);

  if (isAuthStatusLoading && !user) {
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
