export type UserRole = "EMPLOYEE" | "LEADER";
export type BranchType = "본사" | "대리점" | "창고";
export type Region =
  | "서울"
  | "부산"
  | "경기"
  | "인천"
  | "대전"
  | "대구"
  | "광주"
  | "울산"
  | "세종";

export const ROLE_OPTIONS = ["ALL", "EMPLOYEE", "LEADER"] as const;
export type RoleOption = (typeof ROLE_OPTIONS)[number];

export const BRANCH_OPTIONS = ["ALL", "본사", "대리점", "창고"] as const;
export type BranchOption = (typeof BRANCH_OPTIONS)[number];

export const REGION_OPTIONS = [
  "ALL",
  "서울",
  "부산",
  "경기",
  "인천",
  "대전",
  "대구",
  "광주",
  "울산",
  "세종",
] as const;
export type RegionOption = (typeof REGION_OPTIONS)[number];

export type CreateUserDTO = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  region: string;
  branch: BranchType;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  region: string;
  branch: BranchType;
  createdAt: string;
};
