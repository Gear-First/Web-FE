import {
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionCaption,
} from "../../components/common/PageLayout";
import { useState } from "react";
import VendorQuotesTable from "./VendorQuotesTable";
import BasketTable from "./BasketTable";
import type {
  VendorQuote,
  BasketLine,
  MaterialItem,
  CompanyRecord,
} from "../PurchasingTypes";
import { createPurchaseOrders, fetchCompanyCandidates } from "../PurchasingApi";
import styled from "styled-components";
import Button from "../../components/common/Button";
import MaterialSearchModal from "../../bom/components/MaterialSearchModal";
import { useQueryClient } from "@tanstack/react-query";
import SingleDatePicker from "../../components/common/SingleDatePicker";

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

// VendorQuote에 선택 여부를 추가한 확장 타입
type VendorQuoteWithSelected = VendorQuote & { selected?: boolean };

export default function SourcingSection() {
  const queryClient = useQueryClient();

  /** 입력 폼 상태 */
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [needDate, setNeedDate] = useState("");
  const [tempDate, setTempDate] = useState("");

  const [isSearchModalOpen, setSearchModalOpen] = useState(false); // 검색 모달 제어
  const handleSelectMaterial = (selected: MaterialItem) => {
    setMaterialCode(selected.materialCode);
    setMaterialName(selected.materialName);
  };

  const [basket, setBasket] = useState<BasketLine[]>([]);

  // const [materials, setMaterials] = useState<
  //   { id: number; materialCode: string; materialName: string }[]
  // >([]);

  // useEffect(() => {
  //   fetchMaterialList("").then(setMaterials);
  // }, []);

  const [vendorCandidates, setVendorCandidates] = useState<
    VendorQuoteWithSelected[]
  >([]);

  const handleSearch = async () => {
    const dateToUse = tempDate; // 임시 날짜를 지역 변수에 저장
    setNeedDate(dateToUse); // 상태도 업데이트

    if (!materialName && !materialCode) {
      alert("자재명 또는 코드 중 하나를 입력하세요.");
      return;
    }
    if (!dateToUse) {
      alert("날짜를 선택해주세요.");
      return;
    }
    try {
      // YYYY-MM-DD → YYYYMMDD로 변환
      const formattedDate = needDate.replaceAll("-", "");

      const candidates = await fetchCompanyCandidates({
        endDate: formattedDate,
        keyword: materialName || materialCode,
      });

      setVendorCandidates(
        candidates.map((c: CompanyRecord) => ({
          vendorId: c.companyId.toString(),
          vendorName: c.companyName,
          materialName: c.materialName,
          materialCode: c.materialCode ?? "",
          unitPrice: c.price,
          requiredPeriodInDays: c.requiredPeriodInDays ?? 0,
          requiredQuantityPerPeriod: c.quantity,
          expiryDate: c.untilDate,
        }))
      );
    } catch (err) {
      console.error(err);
      alert("업체 조회 중 오류가 발생했습니다.");
    }
  };

  const handleSelectQuote = (q: VendorQuote) => {
    // 중복 방지
    const already = basket.some(
      (b) => b.materialCode === q.materialCode && b.vendorId === q.vendorId
    );
    if (already) return; // 이미 추가된 항목이면 무시

    const line: BasketLine = {
      materialCode: q.materialCode,
      materialName: q.materialName,
      vendorId: q.vendorId,
      vendorName: q.vendorName,
      orderQty: 0,
      unitPrice: q.unitPrice,
      leadTimeDays: q.requiredPeriodInDays,
      eta: needDate,
    };

    setBasket((prev) => [...prev, line]);
  };

  const handleChangeQty = (
    materialCode: string,
    vendorId: string,
    qty: number
  ) => {
    setBasket((prev) =>
      prev.map((line) =>
        line.materialCode === materialCode && line.vendorId === vendorId
          ? { ...line, orderQty: qty }
          : line
      )
    );
  };

  const handleRemove = (itemCode: string, vendorId: string) =>
    setBasket((prev) =>
      prev.filter(
        (x) => !(x.materialCode === itemCode && x.vendorId === vendorId)
      )
    );
  const handleCreatePO = async () => {
    if (basket.length === 0) {
      alert("선정된 업체가 없습니다.");
      return;
    }
    const grouped = basket.reduce((acc, item) => {
      const vendorId = Number(item.vendorId);
      if (!acc[vendorId]) {
        acc[vendorId] = { id: vendorId, orderCnt: 0, totalPrice: 0 };
      }
      acc[vendorId].orderCnt += item.orderQty;
      acc[vendorId].totalPrice += item.orderQty * item.unitPrice;
      return acc;
    }, {} as Record<number, { id: number; orderCnt: number; totalPrice: number }>);

    const payload = Object.values(grouped);

    try {
      const res = await createPurchaseOrders(payload);
      console.log("PO 생성 성공:", res);
      alert("PO 생성이 완료되었습니다!");

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["companyList"] });

      setBasket([]); // 장바구니 비우기
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("자재 목록 조회 실패:", err.message);
      } else {
        console.error("자재 목록 조회 실패:", err);
      }
      return [];
    }
  };

  const filteredCandidates = vendorCandidates.map((v) => ({
    ...v,
    selected: basket.some(
      (b) => b.materialCode === v.materialCode && b.vendorId === v.vendorId
    ),
  }));

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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <Button
              color="gray"
              size="sm"
              onClick={() => setSearchModalOpen(true)}
              style={{
                padding: "6px 12px",
                height: "36px",
                whiteSpace: "nowrap",
              }}
            >
              자재 검색
            </Button>
          </div>

          <StyledInput
            placeholder="자재 코드"
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
            readOnly
          />
          <StyledInput
            placeholder="자재명"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            readOnly
          />
          {/* <StyledInput
            type="date"
            value={needDate}
            onChange={(e) => setNeedDate(e.target.value)}
          /> */}

          <SingleDatePicker
            value={tempDate}
            onChange={(v) => setTempDate(v)} // 클릭 시 임시 상태에만 반영
            placeholder="날짜 선택"
          />
          <SearchButton onClick={handleSearch}>조회</SearchButton>
        </FormContainer>

        {/* 오른쪽: 후보 공급업체 */}
        <div>
          <VendorQuotesTable
            rows={filteredCandidates} // or 그냥 rows={filteredCandidates}
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
      <MaterialSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelect={(material) => {
          handleSelectMaterial(material);
          setSearchModalOpen(false);
        }}
      />
    </SectionCard>
  );
}
