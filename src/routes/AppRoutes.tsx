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
import RequireOrgType from "./guards/RequireOrgType";
import UserProfilePage from "../user/UserProfilePage";
import CarModelPage from "../carModel/CarModelPage";

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
        <Route
          path="/mrp"
          element={
            <RequireOrgType required="본사">
              <BOMPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/request"
          element={
            <RequireOrgType required="본사">
              <RequestPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/items"
          element={
            <RequireOrgType required="본사">
              <ItemPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/part"
          element={
            <RequireOrgType required="본사">
              <PartPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/car-models"
          element={
            <RequireOrgType required="본사">
              <CarModelPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/property"
          element={
            <RequireOrgType required="본사">
              <PropertyPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/inbound"
          element={
            <RequireOrgType required="본사">
              <InboundPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/outbound"
          element={
            <RequireOrgType required="본사">
              <OutboundPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/purchasing"
          element={
            <RequireOrgType required="본사">
              <PurchasingPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/human"
          element={
            <RequireOrgType required="본사">
              <HumanPage />
            </RequireOrgType>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireOrgType required="본사">
              <UserProfilePage />
            </RequireOrgType>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
