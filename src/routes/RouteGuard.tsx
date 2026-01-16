import { Outlet } from "react-router";

interface Props {
  requiredAuth: boolean;
}

const RouteGuard = ({ requiredAuth }: Props) => {
  console.log("requiredAuth", requiredAuth);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RouteGuard;
