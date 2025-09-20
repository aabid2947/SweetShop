import { Routes, Route } from "react-router-dom";

const ProtectedAdminRoutes = () => {
  return (
    <Routes>
      {/* Add protected admin routes here */}
      <Route path="/" element={<div>Admin Dashboard</div>} />
    </Routes>
  );
};

export default ProtectedAdminRoutes;
