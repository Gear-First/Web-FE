import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Footer,
  Header,
  HeaderLeft,
  Input,
  Label,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
  Value,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
import { Select } from "../../components/common/PageLayout";
import type { PartRecord } from "../../items/parts/PartTypes";
import type {
  CarModelRecord,
  PartCarModelMapping,
} from "../CarModelTypes";
import CarModelSearchModal from "./CarModelSearchModal";

interface SubmitPayload {
  carModelId: number;
  note?: string;
  enabled: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  part: PartRecord | null;
  mapping?: PartCarModelMapping | null;
  onSubmit: (payload: SubmitPayload) => Promise<void> | void;
  loading?: boolean;
}

type EnabledOption = "true" | "false";

export default function CarModelMappingModal({
  isOpen,
  onClose,
  mode,
  part,
  mapping,
  onSubmit,
  loading,
}: Props) {
  const [note, setNote] = useState("");
  const [enabled, setEnabled] = useState<EnabledOption>("true");
  const [selectedModel, setSelectedModel] = useState<CarModelRecord | null>(
    null
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNote(mapping?.note ?? "");
    setEnabled(mapping?.enabled === false ? "false" : "true");
    if (mode === "edit" && mapping) {
      setSelectedModel({
        id: mapping.carModelId,
        name: mapping.carModelName,
        enabled: mapping.enabled,
        note: mapping.note,
      });
    } else {
      setSelectedModel(null);
    }
  }, [isOpen, mapping, mode]);

  if (!isOpen || !part) return null;

  const handleSubmit = async () => {
    const target = selectedModel ?? (mapping && {
      id: mapping.carModelId,
      name: mapping.carModelName,
      enabled: mapping.enabled,
    });

    if (!target) {
      alert("차량 모델을 선택해주세요.");
      return;
    }

    await onSubmit({
      carModelId: target.id,
      note: note.trim() ? note.trim() : undefined,
      enabled: enabled === "true",
    });
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer width="640px" onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>
              {mode === "create" ? "차량 모델 추가" : "매핑 정보 수정"}
            </Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>대상 부품</SectionTitle>
          <DetailGrid $cols={2}>
            <DetailItem>
              <Label>부품 코드</Label>
              <Value>{part.partCode}</Value>
            </DetailItem>
            <DetailItem>
              <Label>부품명</Label>
              <Value>{part.partName}</Value>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>차량 모델</SectionTitle>
          {mode === "create" ? (
            <ModelSelectArea>
              <div>
                {selectedModel ? (
                  <SelectedModelCard>
                    <span>{selectedModel.name}</span>
                    <StatusBadge $enabled={selectedModel.enabled}>
                      {selectedModel.enabled ? "활성" : "중지"}
                    </StatusBadge>
                  </SelectedModelCard>
                ) : (
                  <PlaceholderText>
                    차량 모델을 선택하면 이곳에 표시됩니다.
                  </PlaceholderText>
                )}
              </div>
              <Button color="black" size="sm" onClick={() => setIsSearchOpen(true)}>
                모델 선택
              </Button>
            </ModelSelectArea>
          ) : (
            <SelectedModelCard>
              <span>{mapping?.carModelName}</span>
              <StatusBadge $enabled={mapping?.enabled !== false}>
                {mapping?.enabled === false ? "중지" : "활성"}
              </StatusBadge>
            </SelectedModelCard>
          )}
        </Section>

        <Section>
          <SectionTitle>설정</SectionTitle>
          <DetailGrid $cols={1}>
            <DetailItem>
              <Label htmlFor="mapping-note">비고</Label>
              <Input
                as="textarea"
                id="mapping-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="필요 시 참고 메모를 입력하세요."
                disabled={loading}
                style={{ resize: "vertical" }}
              />
            </DetailItem>
            <DetailItem>
              <Label>사용 여부</Label>
              <Select
                value={enabled}
                onChange={(e) => setEnabled(e.target.value as EnabledOption)}
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                <option value="true">활성</option>
                <option value="false">중지</option>
              </Select>
            </DetailItem>
          </DetailGrid>
        </Section>

        <Footer>
          <Button color="gray" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button
            color="black"
            onClick={handleSubmit}
            loading={loading}
            disabled={mode === "create" && !selectedModel}
          >
            {mode === "create" ? "추가" : "저장"}
          </Button>
        </Footer>
      </ModalContainer>

      <CarModelSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(model) => setSelectedModel(model)}
      />
    </Overlay>
  );
}

const ModelSelectArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const SelectedModelCard = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ $enabled?: boolean }>`
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${({ $enabled = true }) => ($enabled ? "#dcfce7" : "#fee2e2")};
  color: ${({ $enabled = true }) => ($enabled ? "#166534" : "#991b1b")};
`;

const PlaceholderText = styled.p`
  margin: 0;
  color: #9ca3af;
  font-size: 0.9rem;
`;
