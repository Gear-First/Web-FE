import { Routes, Route } from "react-router-dom";
import InventoryPage from "../pages/InventoryPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InventoryPage activeMenu="inventory" />} />
    </Routes>
  );
};

export default AppRoutes;
