import type { FC, ReactNode } from "react";
import Layout from "./Layout";
import { PageContainer } from "./PageLayout";

interface PageProps {
  children: ReactNode;
  className?: string;
}

const Page: FC<PageProps> = ({ children, className }) => {
  return (
    <Layout>
      <PageContainer className={className}>{children}</PageContainer>
    </Layout>
  );
};

export default Page;
