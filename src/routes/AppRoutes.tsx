import { Routes, Route, Navigate } from "react-router-dom";
import InventoryPage from "../pages/InventoryPage";
import IssuancePage from "../pages/IssuancePage";
import SupplierOrderPage from "../pages/SupplierOrderPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/issuance" element={<IssuancePage />} />
      <Route path="/supplierOrder" element={<SupplierOrderPage />} />
    </Routes>
  );
};

export default AppRoutes;
