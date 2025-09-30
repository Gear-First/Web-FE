import React from "react";
import styled from "styled-components";
import Layout from "../components/common/Layout";

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const FilterBox = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #f0f2f5;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
`;

const Status = styled.span<{ type: string }>`
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ type }) =>
    type === "등록" ? "#d1f7d6" : type === "등록중" ? "#d6e4ff" : "#ffe6e6"};
  color: ${({ type }) =>
    type === "등록" ? "#2b8a3e" : type === "등록중" ? "#1c3a63" : "#c92a2a"};
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #2980b9;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
interface InventoryProps {
  activeMenu?: string;
}
const mockData = [
  {
    id: 1,
    status: "보류",
    name: "창문",
    amount: "123",
    price: "300,000원",
  },
  {
    id: 2,
    status: "등록",
    name: "보닛",
    amount: "45",
    price: "500,000원",
  },
];

const InventoryPage: React.FC<InventoryProps> = ({
  activeMenu = "inventory",
}) => {
  return (
    <Layout activeMenu={activeMenu}>
      <Content>
        <FilterBox>
          <h3>검색 필터</h3>
          {/* 체크박스, 검색창은 여기 구현 */}
        </FilterBox>

        <Table>
          <thead>
            <tr>
              <Th>번호</Th>
              <Th>상태</Th>
              <Th>재고명</Th>
              <Th>개수</Th>
              <Th>가격</Th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((row) => (
              <tr key={row.id}>
                <Td>{row.id}</Td>
                <Td>
                  <Status type={row.status}>{row.status}</Status>
                </Td>
                <Td>{row.name}</Td>
                <Td>{row.amount}</Td>
                <Td>{row.price}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Layout>
  );
};

export default InventoryPage;
