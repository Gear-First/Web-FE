import { Routes, Route, Navigate } from "react-router-dom";
import IssuancePage from "../issuance/IssuancePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/issuance" replace />} />
      <Route path="/mrp" element={<IssuancePage />} />
      <Route path="/inventory" element={<IssuancePage />} />
      <Route path="/issuance" element={<IssuancePage />} />
      <Route path="/supplierOrder" element={<IssuancePage />} />
    </Routes>
  );
};

export default AppRoutes;
