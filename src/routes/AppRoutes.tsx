import { Routes, Route, Navigate } from "react-router-dom";
import InboundPage from "../inbound/InboundPage";
import OutboundPage from "../outbound/OutboundPage";
import RequestPage from "../request/RequestPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/outbound" replace />} />
      <Route path="/request" element={<RequestPage />} />
      <Route path="/mrp" element={<OutboundPage />} />
      <Route path="/inventory" element={<OutboundPage />} />
      <Route path="/inbound" element={<InboundPage />} />
      <Route path="/outbound" element={<OutboundPage />} />
      <Route path="/supplierOrder" element={<OutboundPage />} />
    </Routes>
  );
};

export default AppRoutes;
