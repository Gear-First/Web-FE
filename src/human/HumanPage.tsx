import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FilterGroup,
  Select,
  SummaryGrid,
  SummaryCard,
  SummaryLabel,
  SummaryValue,
  SummaryNote,
} from "../components/common/PageLayout";
import Button from "../components/common/Button";
import SearchBox from "../components/common/SearchBox";
import Pagination from "../components/common/Pagination";
import UserTable from "./components/UserTable";
import UserRegisterModal from "./components/UserRegisterModal";
import { createUser, userKeys } from "./HumanApi";
import { type CreateUserDTO, type Region, type WorkType } from "./HumanTypes";
import { useRegions, useUsers, useWorkTypes } from "./components/queries";
import FilterResetButton from "../components/common/filters/FilterResetButton";
import Page from "../components/common/Page";
import PageSection from "../components/common/sections/PageSection";
import { usePagination } from "../hooks/usePagination";

export default function HumanPage() {
  const [keyword, setKeyword] = useState("");
  const [rank, setRank] = useState<"EMPLOYEE" | "LEADER" | "ALL">("ALL");
  const [workType, setWorkType] = useState<WorkType | "ALL">("ALL");
  const [region, setRegion] = useState<Region | "ALL">("ALL");
  const [applied, setApplied] = useState<{ keyword: string }>({ keyword: "" });

  const pagination = usePagination(1, 10);
  const [openReg, setOpenReg] = useState(false);

  const { data, fetchStatus } = useUsers({
    q: applied.keyword || undefined,
    rank,
    workTypeId: workType === "ALL" ? undefined : workType.workTypeId,
    regionId: region === "ALL" ? undefined : region.regionId,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  const {
    data: regionRes,
    isPending: isRegionPending,
    isFetching: isRegionFetching,
    error: regionError,
  } = useRegions(true);

  const {
    data: workTypeRes,
    isPending: isWorkTypePending,
    isFetching: isWorkTypeFetching,
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
    pagination.resetPage();
  };

  const onReset = () => {
    setKeyword("");
    setRank("ALL");
    setWorkType("ALL");
    setRegion("ALL");
    pagination.resetPage();
  };

  const isFetching = fetchStatus === "fetching";
  const isRegionInitialLoading = isRegionPending && !regionRes;
  const isWorkTypeInitialLoading = isWorkTypePending && !workTypeRes;
  const isRegionRefreshing = isRegionFetching && !isRegionPending;
  const isWorkTypeRefreshing = isWorkTypeFetching && !isWorkTypePending;
  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const leaderCount = rows.filter((user) => user.rank === "LEADER").length;
  const totalRegions = regionRes?.data?.length ?? 0;
  const totalWorkTypes = workTypeRes?.data?.length ?? 0;
  const regionStatusText = regionError
    ? "0개 지역"
    : `${totalRegions}개 지역${isRegionRefreshing ? " · 갱신 중" : ""}`;
  const workTypeStatusText = workTypeError
    ? "0개 지점"
    : `${totalWorkTypes}개 지점${isWorkTypeRefreshing ? " · 갱신 중" : ""}`;

  const filters = (
    <FilterGroup>
      <FilterResetButton onClick={onReset} />
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
        disabled={isWorkTypeInitialLoading}
      >
        {workTypeOptions.map((w) => (
          <option
            key={w.workTypeId}
            value={w.workTypeName === "ALL" ? "ALL" : String(w.workTypeId)}
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
        disabled={isRegionInitialLoading}
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
        placeholder="이름 / 이메일 / 소속 검색"
      />
    </FilterGroup>
  );

  return (
    <Page>
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>등록 인원</SummaryLabel>
          <SummaryValue>
            {isFetching ? "0" : total.toLocaleString()}
          </SummaryValue>
          <SummaryNote>필터 기준 전체 구성원</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>팀 리더</SummaryLabel>
          <SummaryValue>{leaderCount.toLocaleString()}명</SummaryValue>
          <SummaryNote>현재 페이지 필터 결과</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>커버리지</SummaryLabel>
          <SummaryValue>
            {regionStatusText} · {workTypeStatusText}
          </SummaryValue>
          <SummaryNote>지역 · 지점 마스터</SummaryNote>
        </SummaryCard>
      </SummaryGrid>

      <PageSection
        title="인사관리"
        caption="구성원 계정의 등록·검색·필터링을 관리합니다."
        actions={<Button onClick={() => setOpenReg(true)}>회원가입 +</Button>}
        filters={filters}
        isBusy={
          isFetching || isRegionInitialLoading || isWorkTypeInitialLoading
        }
        footer={
          <Pagination
            page={pagination.page}
            totalPages={Math.max(1, totalPages)}
            onChange={pagination.onChangePage}
            totalItems={total}
            pageSize={pagination.pageSize}
            onChangePageSize={pagination.onChangePageSize}
            showSummary
            showPageSize
            align="center"
          />
        }
      >
        <UserTable rows={rows} />
      </PageSection>

      <UserRegisterModal
        mode="create"
        isOpen={openReg}
        onClose={() => setOpenReg(false)}
        onCreate={async (form) => {
          await createMut.mutateAsync(form);
          setOpenReg(false);
        }}
      />
    </Page>
  );
}
