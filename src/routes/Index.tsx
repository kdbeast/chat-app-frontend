import RouteGuard from "./RouteGuard";
import AppLayout from "@/layouts/AppLayout";
import { Route, Routes } from "react-router";
import BaseLayout from "@/layouts/BaseLayout";
import { authRoutesPaths, protectedRoutesPaths } from "./routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* {Auth / Public Routes} */}
      <Route path="/" element={<RouteGuard requiredAuth={false} />}>
        <Route element={<BaseLayout />}>
          {authRoutesPaths?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      {/* {Protected Routes} */}
      <Route path="/" element={<RouteGuard requiredAuth={true} />}>
        <Route element={<AppLayout />}>
          {protectedRoutesPaths?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
