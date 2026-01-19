import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { bootstrapAuthThunk } from "@/store/slices/authSlice";

const ALLOWED_ROLES = new Set(["ADVISOR", "ADMIN"]);

export default function ProtectedRoute() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, accessToken, bootstrapping } = useAppSelector((s: any) => s.auth);

  useEffect(() => {
    if (bootstrapping) {
      dispatch(bootstrapAuthThunk());
    }
  }, [bootstrapping, dispatch]);

  if (bootstrapping) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!ALLOWED_ROLES.has(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
