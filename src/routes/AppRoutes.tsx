import { Routes, Route, Navigate } from "react-router-dom";
import InboundPage from "../inbound/InboundPage";
import OutboundPage from "../outbound/OutboundPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/outbound" replace />} />
      <Route path="/mrp" element={<OutboundPage />} />
      <Route path="/inventory" element={<OutboundPage />} />
      <Route path="/inbound" element={<InboundPage />} />
      <Route path="/outbound" element={<OutboundPage />} />
      <Route path="/supplierOrder" element={<OutboundPage />} />
    </Routes>
  );
};

export default AppRoutes;
