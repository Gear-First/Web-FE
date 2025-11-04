import {
  USER_BASE_PATH,
  type ApiPage,
  type ApiResponse,
  type ListResponse,
} from "../api";
import type { CreateUserDTO, Region, UserRecord, WorkType } from "./HumanTypes";

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
  const res = await fetch(`${USER_BASE_PATH}/createUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`유저 생성 실패 (${res.status})`);

  const json: ApiResponse<UserRecord> = await res.json();
  if (!json.success) throw new Error(json.message || "유저 생성 실패");

  return json.data;
}

// 유저 수정
export async function updateUser(dto: CreateUserDTO): Promise<UserRecord> {
  const res = await fetch(`${USER_BASE_PATH}/updateUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`유저 수정 실패 (${res.status})`);

  const json: ApiResponse<UserRecord> = await res.json();
  if (!json.success) throw new Error(json.message || "유저 수정 실패");
  return json.data;
}
