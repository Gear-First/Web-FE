import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCard,
  SectionHeader,
  SectionTitle,
  SectionCaption,
  FilterGroup,
  Select,
} from "../components/common/PageLayout";
import Button from "../components/common/Button";
import SearchBox from "../components/common/SearchBox";
import Pagination from "../components/common/Pagination";

import UserTable from "./components/UserTable";
import UserRegisterModal from "./components/UserRegisterModal";
import {
  createUser,
  fetchUsers,
  userKeys,
  type UserListParams,
} from "./HumanApi";
import type { ListResponse } from "../api";
import {
  BRANCH_OPTIONS,
  REGION_OPTIONS,
  ROLE_OPTIONS,
  type BranchOption,
  type CreateUserDTO,
  type Region,
  type RegionOption,
  type RoleOption,
  type UserRecord,
} from "./HumanTypes";
import searchIcon from "../assets/search.svg";
import resetIcon from "../assets/reset.svg";

export default function HumanPage() {
  // 공통 필터
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<RoleOption>("ALL");
  const [branch, setBranch] = useState<BranchOption>("ALL");
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const [applied, setApplied] = useState<{ keyword: string }>({ keyword: "" });

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 모달
  const [openReg, setOpenReg] = useState(false);

  const params: UserListParams = {
    q: applied.keyword || undefined,
    role,
    branch,
    region: region || undefined,
    page,
    pageSize,
  };

  const { data, fetchStatus } = useQuery<ListResponse<UserRecord[]>, Error>({
    queryKey: [...userKeys.list, params],
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const queryClient = useQueryClient();
  const createMut = useMutation({
    mutationFn: (dto: CreateUserDTO) => createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list });
    },
  });

  const onSearch = () => {
    setApplied({ keyword: keyword.trim() });
    setPage(1);
  };

  const onReset = () => {
    setKeyword("");
    setRole("ALL");
    setBranch("ALL");
    setRegion("ALL");
    setPage(1);
  };

  const isFetching = fetchStatus === "fetching";
  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <Layout>
      <PageContainer>
        <SectionCard>
          <SectionHeader>
            <div>
              <SectionTitle>인적관리</SectionTitle>
              <SectionCaption>
                구성원 계정의 등록·검색·필터링을 관리합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <SectionHeader>
            <Button onClick={() => setOpenReg(true)}>+ 회원가입</Button>
            <FilterGroup>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleOption)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL"
                      ? "전체 직급"
                      : opt === "EMPLOYEE"
                      ? "사원"
                      : "팀장"}
                  </option>
                ))}
              </Select>

              <Select
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchOption)}
              >
                {BRANCH_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체 지점" : opt}
                  </option>
                ))}
              </Select>

              <Select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionOption)}
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "전체 지역" : opt}
                  </option>
                ))}
              </Select>

              <SearchBox
                keyword={keyword}
                onKeywordChange={setKeyword}
                onSearch={onSearch}
                onReset={onReset}
                placeholder="이름 / 이메일 / 연락처 검색"
              />
              <Button variant="icon" onClick={onSearch}>
                <img src={searchIcon} width={18} height={18} alt="검색" />
              </Button>
              <Button variant="icon" onClick={onReset}>
                <img src={resetIcon} width={18} height={18} alt="초기화" />
              </Button>
            </FilterGroup>
          </SectionHeader>

          <UserTable rows={rows} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ height: 18 }}>
              {isFetching && (
                <span style={{ fontSize: 12, color: "#6b7280" }}>로딩중…</span>
              )}
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={Math.max(1, totalPages)}
            onChange={(n) => setPage(n)}
            isBusy={isFetching}
            maxButtons={5}
            totalItems={total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onChangePageSize={(n) => {
              setPageSize(n);
              setPage(1);
            }}
            showSummary
            showPageSize
            align="center"
          />
        </SectionCard>
      </PageContainer>

      <UserRegisterModal
        isOpen={openReg}
        onClose={() => setOpenReg(false)}
        onSubmit={async (dto) => {
          await createMut.mutateAsync(dto);
        }}
      />
    </Layout>
  );
}
