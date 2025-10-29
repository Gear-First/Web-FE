import { useCallback, useEffect, useMemo, useState } from "react";
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
  Value,
} from "../../../components/common/ModalPageLayout";
import Button from "../../../components/common/Button";
import type { CategoryFormModel } from "../CategoryTypes";

type Mode = "create" | "edit";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
  initial: CategoryFormModel | null;
  onSubmit: (payload: CategoryFormModel) => Promise<void> | void;
  disableOverlayClose?: boolean;
}

export default function CategoryRegisterModal({
  isOpen,
  onClose,
  mode,
  initial,
  onSubmit,
  disableOverlayClose = false,
}: Props) {
  // 1) 모든 훅은 항상 호출
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxNameLen = 80;
  const maxDescLen = 500;

  const trimmed = useMemo(
    () => ({
      name: name.trim(),
      description: (description ?? "").trim(),
    }),
    [name, description]
  );

  const isDirty = useMemo(() => {
    if (mode === "create") return true;
    return (
      (initial?.name ?? "") !== trimmed.name ||
      (initial?.description ?? "") !== trimmed.description
    );
  }, [mode, initial, trimmed.name, trimmed.description]);

  const validate = useCallback((): string | null => {
    if (!trimmed.name) return "카테고리명은 필수입니다.";
    if (trimmed.name.length > maxNameLen)
      return `카테고리명은 ${maxNameLen}자 이내여야 합니다.`;
    if (trimmed.description.length > maxDescLen)
      return `설명은 ${maxDescLen}자 이내여야 합니다.`;
    if (mode === "edit" && !isDirty) return "변경된 내용이 없습니다.";
    return null;
  }, [
    trimmed.name,
    trimmed.description,
    maxNameLen,
    maxDescLen,
    mode,
    isDirty,
  ]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    const v = validate();
    setErrorMsg(v);
    if (v) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmed.name,
        description: trimmed.description,
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("저장 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validate, onSubmit, trimmed.name, trimmed.description]);

  // ESC / Cmd+Enter
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        void handleSubmit();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, isSubmitting, onClose, handleSubmit]);

  // 프리필 & 상태 초기화
  useEffect(() => {
    if (!isOpen) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setIsSubmitting(false);
    setErrorMsg(null);
  }, [isOpen, initial]);

  // 2) 여기서 early return (훅 이후)
  if (!isOpen) return null;

  const canSubmit =
    trimmed.name.length > 0 &&
    trimmed.name.length <= maxNameLen &&
    trimmed.description.length <= maxDescLen &&
    (mode === "create" || isDirty) &&
    !isSubmitting;

  return (
    <Overlay
      onClick={disableOverlayClose || isSubmitting ? undefined : onClose}
    >
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>
              {mode === "create" ? "카테고리 등록" : "카테고리 수정"}
            </Title>
          </HeaderLeft>
          <CloseButton onClick={isSubmitting ? undefined : onClose}>
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>기본 정보</SectionTitle>
          <DetailGrid $cols={1}>
            <DetailItem>
              <Label>카테고리명</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: Filters"
                maxLength={maxNameLen}
                disabled={isSubmitting}
              />
              <Value style={{ fontSize: 12, color: "#6b7280" }}>
                {name.length}/{maxNameLen}
              </Value>
            </DetailItem>

            <DetailItem>
              <Label>설명</Label>
              <Input
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명을 입력하세요"
                maxLength={maxDescLen}
                disabled={isSubmitting}
                style={{ resize: "vertical" }}
              />
              <Value style={{ fontSize: 12, color: "#6b7280" }}>
                {description.length}/{maxDescLen}
              </Value>
            </DetailItem>

            {errorMsg && (
              <DetailItem>
                <Value style={{ color: "#ef4444" }}>{errorMsg}</Value>
              </DetailItem>
            )}
          </DetailGrid>
        </Section>

        <Section style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? "처리중…" : mode === "create" ? "등록" : "수정"}
          </Button>
          <Button onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
        </Section>
      </ModalContainer>
    </Overlay>
  );
}
