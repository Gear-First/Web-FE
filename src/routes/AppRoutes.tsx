import { Routes, Route, Navigate } from "react-router-dom";
import InventoryPage from "../pages/InventoryPage";
import IssuancePage from "../pages/IssuancePage";
<<<<<<< HEAD
import SupplierOrderPage from "../pages/SupplierOrderPage";
=======
import MRPPage from "../pages/MRPPage";
>>>>>>> 9d8286a730ac3c26c297ec7ee3da62cd67a5cdd8

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="/mrp" element={<MRPPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/issuance" element={<IssuancePage />} />
      <Route path="/supplierOrder" element={<SupplierOrderPage />} />
    </Routes>
  );
};

export default AppRoutes;
