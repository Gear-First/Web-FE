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
} from "../../components/common/ModalPageLayout";
import type { PurchasingRecord } from "../PurchasingTypes";
import Button from "../../components/common/Button";

type Mode = "register" | "view" | "edit";

interface PurchasingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PurchasingRecord, "purchasingId">) => void;
  initialData?: PurchasingRecord;
  mode: Mode;
}

export default function PurchasingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode: initialMode = "register",
  onDelete,
}: PurchasingModalProps & { onDelete?: (id: string) => void }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState<
    PurchasingRecord | Omit<PurchasingRecord, "purchasingId">
  >(() => {
    if (initialData) return { ...initialData };
    return {
      materialCode: "",
      materialName: "",
      purchasingQuantity: 0,
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
          purchasingQuantity: 0,
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

  /** 저장 (등록) 버튼 */
  const handleSubmit = () => {
    const requiredFields = [
      "materialCode",
      "materialName",
      "purchasingQuantity",
      "purchasingPrice",
      "company",
      "surveyDate",
      "expiryDate",
      "requiredQuantityPerPeriod",
      "requiredPeriodInDays",
    ];

    const isEmpty = requiredFields.some(
      (key) => !form[key as keyof typeof form]
    );

    if (isEmpty) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 1일 기준 소요 수량 계산
    const quantityPerDay =
      form.requiredPeriodInDays > 0
        ? form.requiredQuantityPerPeriod / form.requiredPeriodInDays
        : form.requiredQuantityPerPeriod;

    onSubmit({
      ...form,
      requiredQuantityPerPeriod: quantityPerDay, // 1일 기준으로 변경
      requiredPeriodInDays: 1, // 항상 1일로 고정
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
            <Title>구매 요청 등록</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        {/* 자재 기본 정보 */}
        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>자재 코드</Label>
              <Input
                type="text"
                name="materialCode"
                value={form.materialCode}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>

            <DetailItem>
              <Label>자재명</Label>
              <Input
                type="text"
                name="materialName"
                value={form.materialName}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 구매 정보 */}
        <Section>
          <SectionTitle>구매 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>요청 수량</Label>
              <Input
                type="number"
                name="purchasingQuantity"
                value={form.purchasingQuantity}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
            <DetailItem>
              <Label>단가</Label>
              <Input
                type="number"
                name="purchasingPrice"
                value={form.purchasingPrice}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
            <DetailItem>
              <Label>공급업체</Label>
              <Input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 일정 관련 */}
        <Section>
          <SectionTitle>일정 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>조사일</Label>
              <Input
                type="date"
                name="surveyDate"
                value={form.surveyDate}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
            <DetailItem>
              <Label>유효기간</Label>
              <Input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 소요량 정보 */}
        <Section>
          <SectionTitle>소요량 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>소요 수량</Label>
              <Input
                type="number"
                name="requiredQuantityPerPeriod"
                value={form.requiredQuantityPerPeriod}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
            <DetailItem>
              <Label>소요 기간(일)</Label>
              <Input
                type="number"
                name="requiredPeriodInDays"
                value={form.requiredPeriodInDays}
                onChange={handleChange}
                readOnly={readOnly}
              />
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 하단 버튼 */}
        <Section style={{ textAlign: "center" }}>
          {/* 등록 */}
          {mode === "register" && (
            <>
              <Button
                style={{
                  backgroundColor: "#111827",
                  color: "#fff",
                  marginRight: 8,
                }}
                onClick={handleSubmit}
              >
                등록
              </Button>
              <Button
                style={{ backgroundColor: "#6b7280", color: "#fff" }}
                onClick={onClose}
              >
                취소
              </Button>
            </>
          )}

          {/* 상세 보기 */}
          {mode === "view" && (
            <>
              <Button
                style={{
                  backgroundColor: "#111827",
                  color: "#fff",
                  marginRight: 8,
                }}
                onClick={() => setMode("edit")}
              >
                수정
              </Button>
              <Button
                style={{
                  backgroundColor: "#b91c1c",
                  color: "#fff",
                }}
                onClick={handleDelete}
              >
                삭제
              </Button>
            </>
          )}

          {/* 수정 */}
          {mode === "edit" && (
            <>
              <Button
                style={{
                  backgroundColor: "#111827",
                  color: "#fff",
                  marginRight: 8,
                }}
                onClick={handleSubmit}
              >
                저장
              </Button>
              <Button
                style={{
                  backgroundColor: "#6b7280",
                  color: "#fff",
                }}
                onClick={onClose}
              >
                취소
              </Button>
            </>
          )}
        </Section>
      </ModalContainer>
    </Overlay>
  );
}
