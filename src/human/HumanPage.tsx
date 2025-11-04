import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { createUser, userKeys } from "./HumanApi";
import { type CreateUserDTO, type Region, type WorkType } from "./HumanTypes";
import searchIcon from "../assets/search.svg";
import resetIcon from "../assets/reset.svg";
import { useRegions, useUsers, useWorkTypes } from "./components/queries";

export default function HumanPage() {
  // 공통 필터
  const [keyword, setKeyword] = useState("");
  const [rank, setRank] = useState<"EMPLOYEE" | "LEADER" | "ALL">("ALL");
  const [workType, setWorkType] = useState<WorkType | "ALL">("ALL");
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const [applied, setApplied] = useState<{ keyword: string }>({ keyword: "" });

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 모달
  const [openReg, setOpenReg] = useState(false);

  const { data, fetchStatus } = useUsers({
    q: applied.keyword || undefined,
    rank,
    workTypeId: workType === "ALL" ? undefined : workType.workTypeId,
    regionId: region === "ALL" ? undefined : region.regionId,
    page,
    pageSize,
  });

  const {
    data: regionRes,
    isLoading: isRegionLoading,
    error: regionError,
  } = useRegions(true);

  const {
    data: workTypeRes,
    isLoading: isWorkTypeLoading,
    error: workTypeError,
  } = useWorkTypes(true);

  const regionOptions = useMemo(() => {
    const base = regionRes?.data ?? [];
    return [{ regionId: 0, regionName: "ALL" }, ...base];
  }, [regionRes]);

  const workTypeOptions = useMemo(() => {
    const base = workTypeRes?.data ?? [];
    return [{ workTypeId: 0, workTypeName: "ALL" }, ...base];
  }, [workTypeRes]);

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
    setRank("ALL");
    setWorkType("ALL");
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
              <SectionTitle>인사관리</SectionTitle>
              <SectionCaption>
                구성원 계정의 등록·검색·필터링을 관리합니다.
              </SectionCaption>
            </div>
          </SectionHeader>

          <SectionHeader>
            <Button onClick={() => setOpenReg(true)}>회원가입 +</Button>
            <FilterGroup>
              <Select
                value={rank}
                onChange={(e) =>
                  setRank(e.target.value as "EMPLOYEE" | "LEADER" | "ALL")
                }
              >
                <option value="ALL">전체 직급</option>
                <option value="EMPLOYEE">사원</option>
                <option value="LEADER">팀장</option>
              </Select>

              <Select
                value={workType === "ALL" ? "ALL" : String(workType.workTypeId)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "ALL") {
                    setWorkType("ALL");
                  } else {
                    const selected = workTypeOptions.find(
                      (w) => String(w.workTypeId) === v
                    );
                    setWorkType(selected ?? "ALL");
                  }
                }}
                disabled={isWorkTypeLoading}
              >
                {workTypeOptions.map((w) => (
                  <option
                    key={w.workTypeId}
                    value={
                      w.workTypeName === "ALL" ? "ALL" : String(w.workTypeId)
                    }
                  >
                    {w.workTypeName === "ALL" ? "전체 지점" : w.workTypeName}
                  </option>
                ))}
              </Select>

              <Select
                value={region === "ALL" ? "ALL" : String(region.regionId)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "ALL") {
                    setRegion("ALL");
                  } else {
                    const selected = regionOptions.find(
                      (r) => String(r.regionId) === v
                    );
                    setRegion(selected ?? "ALL");
                  }
                }}
                disabled={isRegionLoading}
              >
                {regionOptions.map((r) => (
                  <option
                    key={r.regionId}
                    value={r.regionName === "ALL" ? "ALL" : String(r.regionId)}
                  >
                    {r.regionName === "ALL" ? "전체 지역" : r.regionName}
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
        mode="create"
        isOpen={openReg}
        onClose={() => setOpenReg(false)}
        onCreate={async (dto) => {
          await createMut.mutateAsync(dto);
        }}
      />
    </Layout>
  );
}
