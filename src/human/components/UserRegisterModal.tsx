import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import type {
  CreateUserDTO,
  UserRecord,
  Region,
  WorkType,
  UpdateUserDTO,
} from "../HumanTypes";
import type { Rank } from "../HumanTypes";
import { useRegions, useWorkTypes } from "./queries";
import {
  CloseButton,
  DetailGrid,
  DetailItem,
  Footer,
  Header,
  Input,
  Label,
  ModalContainer,
  Overlay,
  Section,
  Title,
} from "../../components/common/ModalPageLayout";
import { Select } from "../../components/common/PageLayout";

const ErrorBox = styled.div`
  grid-column: 1 / -1;
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.9rem;
`;

type Props = {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  initial?: Partial<UserRecord>;
  onCreate?: (dto: CreateUserDTO) => Promise<void> | void;
  onUpdate?: (dto: UpdateUserDTO) => Promise<void> | void;
  currentUserId?: number;
};

const DEFAULT_RANKS: Rank[] = [
  { rankId: 1, rankName: "EMPLOYEE" },
  { rankId: 2, rankName: "LEADER" },
];

const KO_TO_KEY = (v?: string) =>
  v === "사원" ? "EMPLOYEE" : v === "팀장" ? "LEADER" : v ?? "EMPLOYEE";

type UserFormState = CreateUserDTO & { userId?: number };

export default function UserRegisterModal({
  mode,
  isOpen,
  onClose,
  initial,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = mode === "edit";

  const { data: regionRes } = useRegions(isOpen);
  const { data: workTypeRes } = useWorkTypes(isOpen);

  const regions: Region[] = regionRes?.data ?? [];
  const workTypes: WorkType[] = workTypeRes?.data ?? [];

  const [form, setForm] = useState<UserFormState>({
    name: "",
    personalEmail: "",
    email: "",
    phoneNum: "",
    rank: "EMPLOYEE",
    regionId: 1,
    workTypeId: 1,
    userId: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setBusy(false);

    const fallbackRegionId = regions[0]?.regionId ?? 0;
    const fallbackWorkTypeId = workTypes[0]?.workTypeId ?? 0;

    const regionId =
      initial?.regionId ??
      regions.find((r) => r.regionName === initial?.region)?.regionId ??
      fallbackRegionId;

    const workTypeId =
      initial?.workTypeId ??
      workTypes.find((w) => w.workTypeName === initial?.workType)?.workTypeId ??
      fallbackWorkTypeId;

    setForm({
      name: initial?.name ?? "",
      personalEmail: initial?.personalEmail ?? "",
      email: initial?.email ?? "",
      phoneNum: initial?.phoneNum ?? "",
      rank: KO_TO_KEY(initial?.rank) as "EMPLOYEE" | "LEADER",
      regionId,
      workTypeId,
      userId: initial?.id ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initial?.id]);

  useEffect(() => {
    if (!isOpen || regions.length === 0) return;
    if (!regions.some((r) => r.regionId === form.regionId)) {
      setForm((prev) => ({ ...prev, regionId: regions[0].regionId }));
    }
  }, [isOpen, regions, form.regionId]);

  useEffect(() => {
    if (!isOpen || workTypes.length === 0) return;
    if (!workTypes.some((w) => w.workTypeId === form.workTypeId)) {
      setForm((prev) => ({ ...prev, workTypeId: workTypes[0].workTypeId }));
    }
  }, [isOpen, workTypes, form.workTypeId]);

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!isEdit && !form.personalEmail.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.phoneNum.trim()) return false;
    if (!form.regionId || !form.workTypeId) return false;
    if (!form.rank) return false;
    return true;
  }, [form, isEdit]);

  if (!isOpen) return null;

  const update = <K extends keyof CreateUserDTO>(
    key: K,
    value: CreateUserDTO[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("입력값을 확인해주세요. (이메일/연락처 형식 등)");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (isEdit && typeof onUpdate === "function") {
        if (!form.userId) {
          throw new Error("수정할 사용자 ID를 찾을 수 없습니다.");
        }
        const payload: UpdateUserDTO = {
          userId: form.userId,
          name: form.name,
          personalEmail: form.personalEmail,
          email: form.email,
          phoneNum: form.phoneNum,
          rank: form.rank,
          regionId: form.regionId,
          workTypeId: form.workTypeId,
        };
        await onUpdate(payload);
      } else if (!isEdit && typeof onCreate === "function") {
        await onCreate(form);
      }
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "요청 처리 중 오류가 발생했습니다."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer
        width="40%"
        onClick={(e) => e.stopPropagation()}
        loading={busy}
      >
        <Header>
          <Title>{isEdit ? "사용자 수정" : "회원가입"}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <Section>
            <DetailGrid $cols={2}>
              <DetailItem>
                <Label>이름</Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="홍길동"
                  required
                />
              </DetailItem>

              <DetailItem>
                <Label> 회원직급</Label>
                <Select
                  value={form.rank}
                  onChange={(e) =>
                    update("rank", e.target.value as "EMPLOYEE" | "LEADER")
                  }
                >
                  {DEFAULT_RANKS.map((r) => (
                    <option key={r.rankId} value={r.rankName}>
                      {r.rankName === "EMPLOYEE"
                        ? "사원 (EMPLOYEE)"
                        : "팀장 (LEADER)"}
                    </option>
                  ))}
                </Select>
              </DetailItem>

              {!isEdit && (
                <DetailItem>
                  <Label>개인 이메일</Label>
                  <Input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) => update("personalEmail", e.target.value)}
                    placeholder="personal@example.com"
                    required
                  />
                </DetailItem>
              )}

              <DetailItem>
                <Label>이메일</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="user@gearfirst.com"
                  required
                />
              </DetailItem>

              <DetailItem>
                <Label>연락처</Label>
                <Input
                  value={form.phoneNum}
                  onChange={(e) => update("phoneNum", e.target.value)}
                  placeholder="010-1234-5678"
                  required
                />
              </DetailItem>

              <DetailItem>
                <Label>지역</Label>
                <Select
                  value={String(form.regionId || "")}
                  onChange={(e) => update("regionId", Number(e.target.value))}
                >
                  {!regions.length && <option value="">지역 로딩 중…</option>}
                  {!!regions.length && <option value="">지역 선택</option>}
                  {regions.map((r) => (
                    <option key={r.regionId} value={r.regionId}>
                      {r.regionName}
                    </option>
                  ))}
                </Select>
              </DetailItem>

              <DetailItem>
                <Label>지점</Label>
                <Select
                  value={String(form.workTypeId || "")}
                  onChange={(e) => update("workTypeId", Number(e.target.value))}
                >
                  {!workTypes.length && <option value="">지점 로딩 중…</option>}
                  {!!workTypes.length && <option value="">지점 선택</option>}
                  {workTypes.map((w) => (
                    <option key={w.workTypeId} value={w.workTypeId}>
                      {w.workTypeName}
                    </option>
                  ))}
                </Select>
              </DetailItem>

              {error && <ErrorBox>{error}</ErrorBox>}
            </DetailGrid>
          </Section>

          <Footer>
            <Button type="button" onClick={onClose} color="gray">
              취소
            </Button>
            <Button type="submit" color="black" disabled={!canSubmit || busy}>
              {busy
                ? isEdit
                  ? "저장 중…"
                  : "등록 중…"
                : isEdit
                ? "변경 저장"
                : "등록"}
            </Button>
          </Footer>
        </form>
      </ModalContainer>
    </Overlay>
  );
}
