import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuthLoading, selectIsProfileComplete } from "../features/auth/authSlice";
// import AuthDebugger from "../components/AuthDebugger.jsx";
import PublicRoutes from "./PublicRoutes.jsx";
import ProtectedRoutes from "./ProtectedRoutes.jsx";
import ProtectedAdminRoutes from "./ProtectedAdminRoutes.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignUpPage from "../pages/SignUpPage.jsx";
import SweetsPage from "../pages/SweetsPage.jsx";
import SweetDetailsPage from "../pages/SweetDetailsPage.jsx";
import UserSweetForm from "../pages/UserSweetForm.jsx";

const AppRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const user = useSelector(state => state.auth.user);

  // Show loading while authenticating OR while we have a token but no user data yet
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* <AuthDebugger /> */}
      <Routes>
        {/* Public pages accessible to everyone */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/sweets" element={<SweetsPage />} />
        <Route path="/sweets/:id" element={<SweetDetailsPage />} />
      
        {/* Authentication routes - only accessible when not logged in */}
        <Route path="/login" element={isAuthenticated ? <div>Dashboard Placeholder</div> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <div>Dashboard Placeholder</div> : <SignUpPage />} />
      
        {/* Protected user routes */}
        <Route path="/dashboard/*" element={<ProtectedRoutes />} />
        <Route path="/user/sweet/new" element={isAuthenticated ? <UserSweetForm /> : <LoginPage />} />
      
        {/* Protected admin routes */}
        <Route path="/admin/*" element={<ProtectedAdminRoutes />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
