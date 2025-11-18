import {
  AUTH_ENDPOINTS,
  USER_BASE_PATH,
  type ApiPage,
  type ApiResponse,
  type ListResponse,
} from "../api";
import type {
  CreateUserDTO,
  Region,
  UpdateUserDTO,
  UserRecord,
  WorkType,
} from "./HumanTypes";
import { fetchWithAuth } from "../auth/api/fetchWithAuth";

export type UserListParams = {
  q?: string;
  rank?: string;
  workTypeId?: number;
  regionId?: number;
  page?: number;
  pageSize?: number;
};

export const userKeys = {
  list: ["users", "list"] as const,
  region: ["users", "region"] as const,
  workType: ["users", "workType"] as const,
};

// 지역 조회
export async function getRegion(): Promise<ListResponse<Region[]>> {
  const url = `${USER_BASE_PATH}/getRegion`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) throw new Error(`지역 조회 실패 (${res.status})`);

  const json: ApiResponse<Region[]> = await res.json();
  if (!json.success) throw new Error(json.message || "지역 조회 실패");

  const data = Array.isArray(json.data) ? json.data : [];

  return {
    data,
  };
}

// 지점 조회
export async function getWorkType(): Promise<ListResponse<WorkType[]>> {
  const url = `${USER_BASE_PATH}/getWorkType`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) throw new Error(`지점 조회 실패 (${res.status})`);

  const json: ApiResponse<WorkType[]> = await res.json();
  if (!json.success) throw new Error(json.message || "지점 조회 실패");

  const data = Array.isArray(json.data) ? json.data : [];

  return {
    data,
  };
}

// 유저 조회
export async function fetchUsers(
  params: UserListParams = {}
): Promise<ListResponse<UserRecord[]>> {
  const {
    q,
    rank = "ALL",
    workTypeId,
    regionId,
    page = 1,
    pageSize = 10,
  } = params;

  const url = `${USER_BASE_PATH}/getAllUser`;
  const qs = new URLSearchParams();

  if (rank && rank !== "ALL") qs.set("rank", rank);
  if (typeof workTypeId === "number" && workTypeId > 0)
    qs.set("workTypeId", String(workTypeId));
  if (typeof regionId === "number" && regionId > 0)
    qs.set("regionId", String(regionId));
  if (q) qs.set("keyword", q);

  qs.set("page", String(page - 1));
  qs.set("size", String(pageSize));
  qs.set("sort", "");

  const res = await fetch(`${url}?${qs.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`유저 조회 실패 (${res.status})`);

  const json: ApiResponse<ApiPage<UserRecord>> = await res.json();
  if (!json.success) throw new Error(json.message || "유저 조회 실패");

  const items = Array.isArray(json.data?.content) ? json.data.content : [];

  const total = json.data.totalElements ?? items.length;
  const totalPages =
    json.data.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  return {
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

// 유저 생성
export async function createUser(dto: CreateUserDTO): Promise<UserRecord> {
  // 공개 회원가입 엔드포인트 (인증 헤더 없이 호출)
  const res = await fetch(`${AUTH_ENDPOINTS.SIGN_UP}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(dto),
  });

  const raw = await res.text();
  let parsed: ApiResponse<UserRecord | string | null> | null = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw) as ApiResponse<UserRecord>;
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const message =
      parsed?.message || raw || `유저 생성 실패 (${res.status})`;
    throw new Error(message);
  }

  if (!parsed) {
    throw new Error("유저 생성 실패: 응답을 해석할 수 없습니다.");
  }

  if (!parsed.success) {
    throw new Error(parsed.message || "유저 생성 실패");
  }
  return normalizeUserResponse(parsed.data, dto);
}

// 유저 수정
export async function updateUser(dto: UpdateUserDTO): Promise<UserRecord> {
  if (!dto.userId) {
    throw new Error("유저 수정 실패: userId가 필요합니다.");
  }

  const payload = {
    userId: dto.userId,
    name: dto.name,
    email: dto.email,
    phoneNum: dto.phoneNum,
    rank: dto.rank,
    regionId: dto.regionId,
    workTypeId: dto.workTypeId,
  };

  const res = await fetchWithAuth(`${USER_BASE_PATH}/updateUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  let parsed: ApiResponse<UserRecord | string | null> | null = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw) as ApiResponse<UserRecord>;
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const message =
      parsed?.message || raw || `유저 수정 실패 (${res.status})`;
    throw new Error(message);
  }

  if (!parsed) {
    throw new Error("유저 수정 실패: 응답을 해석할 수 없습니다.");
  }

  if (!parsed.success) {
    throw new Error(parsed.message || "유저 수정 실패");
  }

  return normalizeUserResponse(parsed.data, dto);
}

export async function deleteUser(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("삭제할 사용자 이메일이 필요합니다.");
  }

  const qs = new URLSearchParams({ email: trimmed });
  const res = await fetchWithAuth(`${USER_BASE_PATH}/deleteUser?${qs}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (res.ok) return;

  let message: string | null = null;
  try {
    const json = (await res.json()) as ApiResponse<unknown>;
    message = json.message ?? null;
  } catch {
    message = await res.text();
  }

  throw new Error(message || `회원 삭제 실패 (${res.status})`);
}

function normalizeUserResponse(
  data: UserRecord | string | null | undefined,
  fallback: CreateUserDTO | UpdateUserDTO
): UserRecord {
  if (data && typeof data === "object") {
    return data as UserRecord;
  }
  const fallbackId =
    typeof (fallback as UpdateUserDTO).userId === "number"
      ? (fallback as UpdateUserDTO).userId
      : 0;
  return {
    id: fallbackId,
    name: fallback.name,
    regionId: fallback.regionId,
    region: "",
    workTypeId: fallback.workTypeId,
    workType: "",
    rank: fallback.rank,
    personalEmail: fallback.personalEmail,
    email: fallback.email,
    phoneNum: fallback.phoneNum,
  };
}
