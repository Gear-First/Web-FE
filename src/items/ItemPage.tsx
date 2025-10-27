import Layout from "../components/common/Layout";
import { PageContainer } from "../components/common/PageLayout";
import PartPage from "./parts/PartPage";

export default function ItemPage() {
  return (
    <Layout>
      <PageContainer>
        <PartPage />
      </PageContainer>
    </Layout>
  );
}
