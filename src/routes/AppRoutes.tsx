import { Routes, Route, Navigate } from "react-router-dom";
import InventoryPage from "../pages/InventoryPage";
import IssuancePage from "../pages/IssuancePage";
import MRPPage from "../pages/MRPPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/mrp" element={<MRPPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/issuance" element={<IssuancePage />} />
    </Routes>
  );
};

export default AppRoutes;
