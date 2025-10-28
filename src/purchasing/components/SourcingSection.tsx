import {
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionCaption,
} from "../../components/common/PageLayout";

import { useMemo, useState } from "react";
import VendorQuotesTable from "./VendorQuotesTable";
import BasketTable from "./BasketTable";
import type { VendorQuote, BasketLine } from "../PurchasingTypes";
import { getVendorQuotes } from "../PurchasingApi";
import styled from "styled-components";

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 14px;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: black;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export default function SourcingSection() {
  const quotes = useMemo(() => getVendorQuotes(), []);

  /** 입력 폼 상태 */
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [needDate, setNeedDate] = useState("");

  const [basket, setBasket] = useState<BasketLine[]>([]);

  const [filteredCandidates, setFilteredCandidates] = useState<VendorQuote[]>(
    []
  );

  const handleSearch = () => {
    const code = materialCode.trim().toUpperCase();
    const name = materialName.trim().toUpperCase();
    const searchDate = needDate || new Date().toISOString().split("T")[0];
    setNeedDate(searchDate);

    setFilteredCandidates(
      quotes.filter((q) => {
        const codeMatch = code ? q.materialCode.toUpperCase() === code : true;
        const nameMatch = name ? q.materialName.toUpperCase() === name : true;
        return codeMatch && nameMatch;
      })
    );
  };

  const handleSelectQuote = (q: VendorQuote) => {
    const line: BasketLine = {
      materialCode,
      materialName,
      vendorId: q.vendorId,
      vendorName: q.vendorName,
      orderQty: 0,
      unitPrice: q.unitPrice,
      leadTimeDays: q.requiredPeriodInDays,
      eta: needDate,
    };

    setBasket((prev) => {
      const existsIndex = prev.findIndex(
        (x) =>
          x.materialCode === line.materialCode && x.vendorId === line.vendorId
      );
      if (existsIndex >= 0) {
        const newBasket = [...prev];
        newBasket[existsIndex] = line; // 같은 공급업체이면 교체
        return newBasket;
      } else {
        return [...prev, line]; // 새 항목 추가
      }
    });
  };

  const handleChangeQty = (itemCode: string, qty: number) => {
    setBasket((prev) =>
      prev.map((x) =>
        x.materialCode === itemCode ? { ...x, orderQty: qty } : x
      )
    );
  };
  const handleRemove = (itemCode: string) =>
    setBasket((prev) => prev.filter((x) => x.materialCode !== itemCode));

  const handleCreatePO = () => {
    // PO 처리
    setBasket([]);
  };

  return (
    <SectionCard>
      <SectionHeader>
        <div>
          <SectionTitle>공급업체 선정</SectionTitle>
          <SectionCaption>
            자재 입력 → 공급업체 선택 → 장바구니 → PO 생성
          </SectionCaption>
        </div>
      </SectionHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        {/* 왼쪽: 자재 입력 */}
        <FormContainer>
          <StyledInput
            placeholder="자재 코드"
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
          />
          <StyledInput
            placeholder="자재명"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
          />
          <StyledInput
            type="date"
            value={needDate}
            onChange={(e) => setNeedDate(e.target.value)}
          />
          <SearchButton onClick={handleSearch}>조회</SearchButton>
        </FormContainer>

        {/* 오른쪽: 후보 공급업체 */}
        <div>
          <VendorQuotesTable
            rows={filteredCandidates}
            needDate={needDate}
            onSelect={handleSelectQuote}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <BasketTable
          lines={basket}
          onChangeQty={handleChangeQty}
          onRemove={handleRemove}
          onCreatePO={handleCreatePO}
        />
      </div>
    </SectionCard>
  );
}
