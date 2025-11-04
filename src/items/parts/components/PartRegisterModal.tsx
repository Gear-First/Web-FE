import { useState, useEffect } from "react";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Header,
  HeaderLeft,
  Input,
  Label,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";
import styled from "styled-components";
import { Select } from "../../../components/common/PageLayout";

import type { PartFormModel, ServerPartCategory } from "../PartTypes";
import { fetchPartCategories } from "../PartApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initial?: PartFormModel | null;
  onSubmit?: (payload: PartFormModel) => void;
}

const PartRegisterModal = ({
  isOpen,
  onClose,
  mode = "create",
  initial = null,
  onSubmit,
}: Props) => {
  const [partCode, setPartCode] = useState("");
  const [partName, setPartName] = useState("");
  const [partPrice, setPartPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string | number | "">("");
  const [categories, setCategories] = useState<ServerPartCategory[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);

  /* 카테고리 로드 */
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const list = await fetchPartCategories(); // 서버: /parts/categories?keyword=
        setCategories(list);
      } catch {
        setCategories([]); // 실패 시 빈 목록
      }
    })();
  }, [isOpen]);

  /* 초기값 주입 */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initial) {
      setPartCode(initial.partCode ?? "");
      setPartName(initial.partName ?? "");
      setPartPrice(initial.partPrice ?? 0);
      setCategoryId(initial.categoryId ?? "");
      setEnabled(initial.enabled ?? true);
    } else {
      setPartCode("");
      setPartName("");
      setPartPrice("");
      setCategoryId("");
      setEnabled(true);
    }
  }, [isOpen, mode, initial]);

  const handleSubmit = () => {
    if (!partCode.trim()) return alert("부품 코드를 입력하세요.");
    if (!partName.trim()) return alert("부품명을 입력하세요.");
    if (categoryId === "" || categoryId == null)
      return alert("카테고리를 선택하세요.");
    if (partPrice === "" || Number(partPrice) < 0)
      return alert("가격을 0 이상으로 입력하세요.");

    const payload: PartFormModel = {
      partCode: partCode.trim(),
      partName: partName.trim(),
      partPrice: Number(partPrice),
      categoryId: Number(categoryId),
      enabled: mode === "edit" ? enabled : true,
    };

    onSubmit?.(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>{mode === "edit" ? "부품 수정" : "부품 등록"}</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        {/* 부품 정보 */}
        <Section>
          <SectionTitle>부품 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>부품 코드</Label>
              <Input
                placeholder="예) PRT-FAN-501"
                value={partCode}
                onChange={(e) => setPartCode(e.target.value)}
              />
            </DetailItem>

            <DetailItem>
              <Label>부품명</Label>
              <Input
                placeholder="예) 냉각 팬"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
              />
            </DetailItem>

            <DetailItem>
              <Label>부품 카테고리</Label>
              <Select
                style={{ width: "50%" }}
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">선택하세요</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </DetailItem>

            <DetailItem>
              <Label>가격</Label>
              <Input
                type="number"
                min={0}
                placeholder="예) 15000"
                value={partPrice}
                onChange={(e) =>
                  setPartPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </DetailItem>

            <DetailItem>
              <Label>상태</Label>
              <Select
                style={{ width: "50%" }}
                value={String(enabled)}
                onChange={(e) => setEnabled(e.target.value === "true")}
                disabled={mode !== "edit"}
                aria-label="사용 여부"
              >
                <option value="true">사용</option>
                <option value="false">미사용</option>
              </Select>
            </DetailItem>
          </DetailGrid>
        </Section>

        {/* 액션 */}
        <Section>
          <Actions>
            <Button color="gray" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {mode === "edit" ? "수정 저장" : "등록"}
            </Button>
          </Actions>
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default PartRegisterModal;

// 하단 액션
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
