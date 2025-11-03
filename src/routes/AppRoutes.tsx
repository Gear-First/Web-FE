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

const AppRoutes = () => {
  return (
    <Routes>
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
    </Routes>
  );
};

export default AppRoutes;
