import { Routes, Route, Navigate } from "react-router-dom";
import InventoryPage from "../pages/InventoryPage";
import IssuancePage from "../pages/IssuancePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/issuance" element={<IssuancePage />} />
    </Routes>
  );
};

export default AppRoutes;
