import type { ListResponse } from "../api";
import type { CreateUserDTO, UserRecord } from "./HumanTypes";

// ---- 실제 API 연동 시 이 부분만 바꾸면 됨 ----
const mockDB: UserRecord[] = [
  {
    id: "U-001",
    name: "김민수",
    email: "minsu@gearfirst.com",
    phone: "010-1234-5678",
    role: "EMPLOYEE",
    region: "서울",
    branch: "본사",
    createdAt: "2025-10-20T12:10:00Z",
  },
  {
    id: "U-002",
    name: "박지영",
    email: "jiyoung@gearfirst.com",
    phone: "010-2222-3333",
    role: "LEADER",
    region: "경기",
    branch: "대리점",
    createdAt: "2025-10-22T09:00:00Z",
  },
];

export type UserListParams = {
  q?: string; // 이름/이메일 검색
  role?: "EMPLOYEE" | "LEADER" | "ALL";
  branch?: "본사" | "대리점" | "창고" | "ALL";
  region?: string; // 선택 시 해당 지역만
  page?: number; // 1-based
  pageSize?: number;
};

export const userKeys = {
  list: ["users", "list"] as const,
};

export async function fetchUsers(
  params: UserListParams
): Promise<ListResponse<UserRecord[]>> {
  // --- 실제 API 예시 ---
  // const res = await axios.get("/api/users", { params: { ...params, page: params.page-1 } });
  // return res.data;

  // --- Mock ---
  const { q, role, branch, region, page = 1, pageSize = 10 } = params || {};
  let rows = [...mockDB];

  if (q) {
    const s = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.includes(q)
    );
  }
  if (role && role !== "ALL") rows = rows.filter((r) => r.role === role);
  if (branch && branch !== "ALL")
    rows = rows.filter((r) => r.branch === branch);
  if (region && region !== "ALL")
    rows = rows.filter((r) => r.region === region);

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);

  await new Promise((r) => setTimeout(r, 300)); // loading 느낌

  return {
    data: paged,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function createUser(dto: CreateUserDTO): Promise<UserRecord> {
  // --- 실제 API 예시 ---
  // const res = await axios.post("/api/users", dto);
  // return res.data;

  // --- Mock ---
  const rec: UserRecord = {
    ...dto,
    id: `U-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    createdAt: new Date().toISOString(),
  };
  mockDB.unshift(rec);
  await new Promise((r) => setTimeout(r, 300));
  return rec;
}
