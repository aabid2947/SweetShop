import { Routes, Route, Navigate } from "react-router-dom";

// This component is kept for backward compatibility
// Most public routes are now handled in the main AppRoutes
const PublicRoutes = () => {
  return (
    <Routes>
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
