import { Routes, Route, Navigate } from "react-router-dom";
import InventoryPage from "../pages/InventoryPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/inventory" element={<InventoryPage />} />
    </Routes>
  );
};

export default AppRoutes;
