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
import type { MaterialFormModel } from "../MaterialTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initial?: MaterialFormModel | null;
  onSubmit?: (payload: MaterialFormModel) => void;
}

const MaterialRegisterModal = ({
  isOpen,
  onClose,
  mode = "create",
  initial = null,
  onSubmit,
}: Props) => {
  const [materialCode, setMaterialCode] = useState("");
  const [materialName, setMaterialName] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initial) {
      setMaterialCode(initial.materialCode ?? "");
      setMaterialName(initial.materialName ?? "");
    } else {
      setMaterialCode("");
      setMaterialName("");
    }
  }, [isOpen, mode, initial]);

  const handleSubmit = () => {
    if (!materialCode.trim()) return alert("자재코드를 입력하세요.");
    if (!materialName.trim()) return alert("자재명을 입력하세요.");

    const payload: MaterialFormModel = {
      materialId: 0,
      materialCode: materialCode.trim(),
      materialName: materialName.trim(),
      createdDate: initial?.createdDate,
    };

    onSubmit?.(payload);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>{mode === "edit" ? "자재 수정" : "자재 등록"}</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <DetailGrid>
            <DetailItem>
              <Label>자재 코드</Label>
              <Input
                placeholder="예) PRT-FAN-501"
                value={materialCode}
                onChange={(e) => setMaterialCode(e.target.value)}
              />
            </DetailItem>

            <DetailItem>
              <Label>자재명</Label>
              <Input
                placeholder="예) 냉각 팬"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
            </DetailItem>
          </DetailGrid>
        </Section>

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

export default MaterialRegisterModal;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
