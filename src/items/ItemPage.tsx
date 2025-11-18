import Layout from "../components/common/Layout";
import { PageContainer } from "../components/common/PageLayout";
import CategoryPage from "./categories/CategoryPage";
import MaterialPage from "./materials/MaterialPage";
import PartPage from "./parts/PartPage";
import styled from "styled-components";

export default function ItemPage() {
  return (
    <Layout>
      <PageContainer>
        <FullRow>
          <PartPage />
        </FullRow>

        <TwoCol>
          <Col>
            <MaterialPage />
          </Col>
          <Col>
            <CategoryPage />
          </Col>
        </TwoCol>
      </PageContainer>
    </Layout>
  );
}

const FullRow = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

const TwoCol = styled.div`
  display: grid;
  gap: 24px;

  grid-template-columns: repeat(2, minmax(360px, 1fr));

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  min-width: 0;
`;
