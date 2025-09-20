import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import AddSweetForm from "../pages/AddSweetForm.jsx";

const ProtectedAdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Dashboard */}
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      
      {/* Sweet Management */}
      <Route path="/sweets/new" element={<AddSweetForm />} />
    </Routes>
  );
};

export default ProtectedAdminRoutes;
