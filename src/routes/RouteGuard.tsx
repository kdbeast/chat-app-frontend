import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Outlet, useNavigate } from "react-router";

interface Props {
  requiredAuth: boolean;
}

const RouteGuard = ({ requiredAuth }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requiredAuth && !user) {
      navigate("/", { replace: true });
    }

    if (!requiredAuth && user) {
      navigate("/chat", { replace: true });
    }
  }, [requiredAuth, user, navigate]);

  if ((requiredAuth && !user) || (!requiredAuth && user)) {
    return null;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RouteGuard;
