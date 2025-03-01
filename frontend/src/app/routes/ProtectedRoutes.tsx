import { useAuth } from "@context";
import { UserRole } from "@types";
import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

type ProtectedRouteProps = PropsWithChildren & {
  allowedRoles?: UserRole[];
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user === null) navigate("/login");
  }, [user, navigate]);

  if (user === undefined) {
    return <div>loading...</div>;
  }

  if (user)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <NotFoundPage />;
    }

  return <>{children}</>;
};

export default ProtectedRoute;
