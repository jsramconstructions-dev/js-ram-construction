import { Navigate, Outlet } from "react-router-dom";
import { isUserAuthenticated } from "../../services/dataStorage";

function ProtectedRoute({ children }) {
  const auth = isUserAuthenticated();

  if (!auth) {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
