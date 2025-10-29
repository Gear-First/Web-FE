import Layout from "../components/common/Layout";
import { PageContainer } from "../components/common/PageLayout";
import CategoryPage from "./categories/CategoryPage";
import MaterialPage from "./materials/MaterialPage";
import PartPage from "./parts/PartPage";

export default function ItemPage() {
  return (
    <Layout>
      <PageContainer>
        <PartPage />
        <MaterialPage />
        <CategoryPage />
      </PageContainer>
    </Layout>
  );
}
