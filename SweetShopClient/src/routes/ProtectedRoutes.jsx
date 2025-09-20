import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuthLoading } from "../features/auth/authSlice";

const ProtectedRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  // Show loading while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<div>Dashboard Placeholder</div>} />
      <Route path="/dashboard" element={<div>Dashboard Placeholder</div>} />
      {/* Add more dashboard-specific routes here */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
