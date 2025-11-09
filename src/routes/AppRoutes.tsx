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
import DashboardPage from "../dashboard/DashboardPage";
import RequireAuth from "./RequireAuth";
import UserProfilePage from "../user/UserProfilePage";

import Login from "../auth/pages/Login";
import AuthCallback from "../auth/pages/AuthCallback";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mrp" element={<BOMPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/items" element={<ItemPage />} />
        <Route path="/part" element={<PartPage />} />
        <Route path="/property" element={<PropertyPage />} />
        <Route path="/inbound" element={<InboundPage />} />
        <Route path="/outbound" element={<OutboundPage />} />
        <Route path="/purchasing" element={<PurchasingPage />} />
        <Route path="/human" element={<HumanPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
