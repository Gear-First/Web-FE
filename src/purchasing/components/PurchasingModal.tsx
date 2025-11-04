import React, { useState, useEffect } from "react";
import {
  Overlay,
  ModalContainer,
  Header,
  HeaderLeft,
  Title,
  CloseButton,
  Section,
  SectionTitle,
  DetailGrid,
  DetailItem,
  Label,
  Input,
  Value,
} from "../../components/common/ModalPageLayout";
import type { PurchasingRecord, MaterialItem } from "../PurchasingTypes";
import Button from "../../components/common/Button";
import SingleDatePicker from "../../components/common/SingleDatePicker";
import styled from "styled-components";
import MaterialSearchModal from "../../bom/components/MaterialSearchModal";

type Mode = "register" | "view" | "edit";

interface PurchasingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PurchasingRecord, "purchasingId">) => void;
  initialData?: PurchasingRecord;
  mode: Mode;
}

const Suffix = styled.span`
  margin-left: 4px;
  color: #6b7280;
`;

export default function PurchasingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode: initialMode = "register",
  onDelete,
}: PurchasingModalProps & { onDelete?: (id: string) => void }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false); // 검색 모달 제어
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );
  const [form, setForm] = useState<
    PurchasingRecord | Omit<PurchasingRecord, "purchasingId">
  >(() => {
    if (initialData) return { ...initialData };
    return {
      materialCode: "",
      materialName: "",
      purchasingPrice: 0,
      company: "",
      surveyDate: "",
      expiryDate: "",
      requiredQuantityPerPeriod: 0,
      requiredPeriodInDays: 0,
      status: "등록" as const,
    };
  });

  const readOnly = mode === "view";

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm(initialData); // 상세보기/수정용 초기 데이터
        setMode("view"); // row 클릭 시 읽기 전용
      } else {
        setForm({
          materialCode: "",
          materialName: "",
          purchasingPrice: 0,
          company: "",
          surveyDate: "",
          expiryDate: "",
          requiredQuantityPerPeriod: 0,
          requiredPeriodInDays: 0,
          status: "등록",
        }); // 등록 모드 초기화
        setMode("register");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  /** 입력 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name.includes("Quantity") ||
        name.includes("Price") ||
        name.includes("Days")
          ? Number(value)
          : value,
    }));
  };

  /** 자재 선택 시 */
  const handleSelectMaterial = (selected: MaterialItem) => {
    setSelectedMaterialId(selected.id);
    setForm((prev) => ({
      ...prev,
      materialCode: selected.materialCode,
      materialName: selected.materialName,
    }));
  };

  /** 저장 (등록) 버튼 */
  const handleSubmit = () => {
    const required = [
      "materialCode",
      "materialName",
      "purchasingPrice",
      "company",
      "surveyDate",
      "expiryDate",
      "requiredQuantityPerPeriod",
      "requiredPeriodInDays",
    ];
    if (required.some((k) => !form[k as keyof typeof form])) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    onSubmit({
      ...(form as Omit<PurchasingRecord, "purchasingId">),
      materialId: selectedMaterialId ?? undefined,
    });
    onClose();
  };
  const handleDelete = () => {
    if (!initialData) return; // 초기 등록 모드면 삭제 불가
    if (onDelete) onDelete(initialData.purchasingId);
    onClose();
  };

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <HeaderLeft>
            <Title>
              구매 요청{" "}
              {mode === "register" ? "등록" : mode === "edit" ? "수정" : "상세"}
            </Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        {/* 자재 기본 정보 */}
        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <DetailGrid $cols={3}>
            {/* 자재명 */}
            <DetailItem>
              <Label>자재명</Label>
              {readOnly ? (
                <Value>{form.materialName}</Value>
              ) : (
                <Input value={form.materialName} readOnly />
              )}
            </DetailItem>

            {/* 자재 코드 */}
            <DetailItem>
              <Label>자재 코드</Label>
              {readOnly ? (
                <Value>{form.materialCode}</Value>
              ) : (
                <Input value={form.materialCode} readOnly />
              )}
            </DetailItem>

            {/* 버튼 */}
            <DetailItem
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
              }}
            >
              {!readOnly && (
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
              )}
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 구매 정보 */}
        <Section>
          <SectionTitle>구매 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>단가</Label>
              {readOnly ? (
                <Value>{form.purchasingPrice.toLocaleString()} 원</Value>
              ) : (
                <Input
                  type="number"
                  name="purchasingPrice"
                  value={form.purchasingPrice}
                  onChange={handleChange}
                />
              )}
            </DetailItem>
            <DetailItem>
              <Label>공급업체</Label>
              {readOnly ? (
                <Value>{form.company}</Value>
              ) : (
                <Input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                />
              )}
            </DetailItem>
            <DetailItem></DetailItem>
            <DetailItem>
              <Label>소요 수량</Label>
              {readOnly ? (
                <Value>{form.requiredQuantityPerPeriod}</Value>
              ) : (
                <Input
                  type="number"
                  name="requiredQuantityPerPeriod"
                  value={form.requiredQuantityPerPeriod}
                  onChange={handleChange}
                  readOnly={readOnly}
                />
              )}
            </DetailItem>
            <DetailItem>
              <Label>소요 기간(일)</Label>
              {readOnly ? (
                <Value>{form.requiredPeriodInDays}</Value>
              ) : (
                <Input
                  type="number"
                  name="requiredPeriodInDays"
                  value={form.requiredPeriodInDays}
                  onChange={handleChange}
                  readOnly={readOnly}
                />
              )}
            </DetailItem>
            {mode === "view" && (
              <>
                <DetailItem>
                  <Label>1일 기준 소요량</Label>
                  <Value>
                    {Math.ceil(
                      form.requiredQuantityPerPeriod /
                        (form.requiredPeriodInDays || 1)
                    )}
                    <Suffix>/1일</Suffix>
                  </Value>
                </DetailItem>
              </>
            )}
          </DetailGrid>
        </Section>

        {/* 일정 관련 */}
        <Section style={{ paddingBottom: "20px" }}>
          <SectionTitle>일정 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>조사일</Label>
              {readOnly ? (
                <Value>{form.surveyDate || "-"}</Value>
              ) : (
                <SingleDatePicker
                  value={form.surveyDate}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, surveyDate: v }))
                  }
                  placeholder="조사일"
                />
              )}
            </DetailItem>
            <DetailItem>
              <Label>유효기간</Label>
              {readOnly ? (
                <Value>{form.expiryDate || "-"}</Value>
              ) : (
                <SingleDatePicker
                  value={form.expiryDate}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, expiryDate: v }))
                  }
                  placeholder="유효기간"
                  min={form.surveyDate}
                />
              )}
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 하단 버튼 */}
        {/* <Section style={{ textAlign: "center" }}> */}
        {/* 등록 */}
        {/* {mode === "register" && (
            <>
              <Button
                style={{
                  marginRight: 8,
                }}
                color="black"
                onClick={handleSubmit}
              >
                등록
              </Button>
              <Button color="gray" onClick={onClose}>
                취소
              </Button>
            </>
          )} */}

        {/* 상세 보기 */}
        {/* {mode === "view" && (
            <>
              <Button
                style={{
                  marginRight: 8,
                }}
                color="black"
                onClick={() => setMode("edit")}
              >
                수정
              </Button>
              <Button color="danger" onClick={handleDelete}>
                삭제
              </Button>
            </>
          )} */}

        {/* 수정 */}
        {/* {mode === "edit" && (
            <>
              <Button
                style={{
                  marginRight: 8,
                }}
                color="black"
                onClick={handleSubmit}
              >
                저장
              </Button>
              <Button color="gray" onClick={onClose}>
                취소
              </Button>
            </>
          )}
        </Section> */}
        <MaterialSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelect={(material) => {
            handleSelectMaterial(material);
            setSearchModalOpen(false);
          }}
        />
      </ModalContainer>
    </Overlay>
  );
}
