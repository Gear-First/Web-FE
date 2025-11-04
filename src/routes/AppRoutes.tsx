import { Routes, Route, Navigate } from "react-router-dom";
import InboundPage from "../inbound/InboundPage";
import OutboundPage from "../outbound/OutboundPage";
import BOMPage from "../bom/BOMPage";
import RequestPage from "../request/RequestPage";
import PartPage from "../part/PartPage";
import PropertyPage from "../property/PropertyPage";
import ItemPage from "../items/ItemPage";
import PurchasingPage from "../purchasing/PurchasingPage";
import HumanPage from "../human/HumanPage";
import LoginPage from "../auth/pages/LoginPage";
import AuthCallbackPage from "../auth/pages/AuthCallbackPage";
// import RequireAuth from "../auth/pages/RequireAuth";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* <Route element={<RequireAuth />}> */}
      <Route path="/" element={<Navigate to="/outbound" replace />} />
      <Route path="/mrp" element={<BOMPage />} />
      <Route path="/request" element={<RequestPage />} />
      <Route path="/items" element={<ItemPage />} />
      <Route path="/part" element={<PartPage />} />
      <Route path="/property" element={<PropertyPage />} />
      <Route path="/inbound" element={<InboundPage />} />
      <Route path="/outbound" element={<OutboundPage />} />
      <Route path="/purchasing" element={<PurchasingPage />} />
      <Route path="/human" element={<HumanPage />} />
      {/* </Route> */}
    </Routes>
  );
};

export default AppRoutes;
