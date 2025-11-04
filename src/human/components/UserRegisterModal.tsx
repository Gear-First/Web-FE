import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import type {
  CreateUserDTO,
  UserRecord,
  Region,
  WorkType,
} from "../HumanTypes";
import type { Rank } from "../HumanTypes";
import { useRegions, useWorkTypes } from "./queries";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;
const Modal = styled.div`
  width: 560px;
  max-width: 95%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
`;
const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.05rem;
`;
const Body = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
const Footer = styled.div`
  padding: 14px 20px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
const Field = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #111827;
`;
const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  &:focus {
    outline: none;
    border-color: #111;
  }
`;
const Select = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  &:focus {
    outline: none;
    border-color: #111;
  }
`;
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
  onUpdate?: (dto: CreateUserDTO) => Promise<void> | void;
  currentUserId?: number;
};

const DEFAULT_RANKS: Rank[] = [
  { rankId: 1, rankName: "EMPLOYEE" },
  { rankId: 2, rankName: "LEADER" },
];

const KO_TO_KEY = (v?: string) =>
  v === "사원" ? "EMPLOYEE" : v === "팀장" ? "LEADER" : v ?? "EMPLOYEE";

export default function UserRegisterModal({
  mode,
  isOpen,
  onClose,
  initial,
  onCreate,
  onUpdate,
  currentUserId = 0,
}: Props) {
  const isEdit = mode === "edit";

  const { data: regionRes } = useRegions(isOpen);
  const { data: workTypeRes } = useWorkTypes(isOpen);

  const regions: Region[] = regionRes?.data ?? [];
  const workTypes: WorkType[] = workTypeRes?.data ?? [];

  const [form, setForm] = useState<CreateUserDTO>({
    name: "",
    email: "",
    phoneNum: "",
    rank: "EMPLOYEE",
    regionId: 0,
    workTypeId: 0,
    userId: currentUserId,
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
      email: initial?.email ?? "",
      phoneNum: initial?.phoneNum ?? "",
      rank: KO_TO_KEY(initial?.rank) as "EMPLOYEE" | "LEADER",
      regionId,
      workTypeId,
      userId: currentUserId,
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
    if (!form.email.trim()) return false;
    if (!form.phoneNum.trim()) return false;
    if (!form.regionId || !form.workTypeId) return false;
    if (!form.rank) return false;
    return true;
  }, [form]);

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
        await onUpdate(form); // DTO 전체 (userId 포함)
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
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <span>{isEdit ? "사용자 수정" : "회원가입"}</span>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </Header>

        <form onSubmit={handleSubmit}>
          <Body>
            <Field>
              이름
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="홍길동"
                required
              />
            </Field>

            <Field>
              회원직급
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
            </Field>

            <Field>
              이메일
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="user@gearfirst.com"
                required
              />
            </Field>

            <Field>
              연락처
              <Input
                value={form.phoneNum}
                onChange={(e) => update("phoneNum", e.target.value)}
                placeholder="010-1234-5678"
                required
              />
            </Field>

            <Field>
              지역
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
            </Field>

            <Field>
              지점
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
            </Field>

            {error && <ErrorBox>{error}</ErrorBox>}
          </Body>

          <Footer>
            <Button type="button" onClick={onClose}>
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
      </Modal>
    </Overlay>
  );
}
