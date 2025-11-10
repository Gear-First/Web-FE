import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { CarModelCreateDTO } from "../CarModelTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CarModelCreateDTO) => Promise<void> | void;
  loading?: boolean;
}

export default function CarModelRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState<"true" | "false">("true");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxNameLen = 100;

  const trimmed = useMemo(() => name.trim(), [name]);

  const validate = useCallback((): string | null => {
    if (!trimmed) return "차량 모델명은 필수입니다.";
    if (trimmed.length > maxNameLen)
      return `차량 모델명은 ${maxNameLen}자 이내여야 합니다.`;
    return null;
  }, [trimmed, maxNameLen]);

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    const v = validate();
    setErrorMsg(v);
    if (v) return;

    try {
      await onSubmit({
        name: trimmed,
        enabled: enabled === "true",
      });
      setName("");
      setEnabled("true");
      setErrorMsg(null);
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("등록 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  }, [loading, validate, onSubmit, trimmed, enabled, onClose]);

  // ESC / Cmd+Enter
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        void handleSubmit();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, loading, onClose, handleSubmit]);

  // 상태 초기화
  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setEnabled("true");
    setErrorMsg(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit =
    trimmed.length > 0 &&
    trimmed.length <= maxNameLen &&
    !loading;

  return (
    <Overlay onClick={loading ? undefined : onClose}>
      <ModalContainer width="40%" onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>차량 모델 등록</Title>
          </HeaderLeft>
          <CloseButton onClick={loading ? undefined : onClose}>
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>기본 정보</SectionTitle>
          <DetailGrid $cols={1}>
            <DetailItem>
              <Label>차량 모델명</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: Sonata, Camry"
                maxLength={maxNameLen}
                disabled={loading}
                autoFocus
              />
              <Value style={{ fontSize: 12, color: "#6b7280" }}>
                {name.length}/{maxNameLen}
              </Value>
            </DetailItem>

            <DetailItem>
              <Label>사용 여부</Label>
              <Select
                value={enabled}
                onChange={(e) => setEnabled(e.target.value as "true" | "false")}
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                <option value="true">활성</option>
                <option value="false">중지</option>
              </Select>
            </DetailItem>

            {errorMsg && (
              <DetailItem>
                <Value style={{ color: "#ef4444", fontSize: 0.9 }}>
                  {errorMsg}
                </Value>
              </DetailItem>
            )}
          </DetailGrid>
        </Section>

        <Footer>
          <Button color="black" onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? "등록 중…" : "등록"}
          </Button>
          <Button color="gray" onClick={onClose} disabled={loading}>
            취소
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
}

