import { useEffect, useMemo, useState } from "react";
import {
  CloseButton,
  Header,
  HeaderLeft,
  ModalContainer,
  Overlay,
  Section,
  SectionTitle,
  Title,
} from "../../components/common/ModalPageLayout";
import {
  Table,
  Th,
  Td,
  Select,
} from "../../components/common/PageLayout";
import Button from "../../components/common/Button";
import SearchBox from "../../components/common/SearchBox";
import Pagination from "../../components/common/Pagination";
import { useCarModelSearch } from "../hooks/useCarModelSearch";
import type { CarModelRecord } from "../CarModelTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: CarModelRecord) => void;
  pageSize?: number;
}

type StatusFilter = "all" | "true" | "false";

const DEFAULT_PAGE_SIZE = 6;

export default function CarModelSearchModal({
  isOpen,
  onClose,
  onSelect,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("true");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("true");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setKeyword("");
      setStatus("true");
      setAppliedKeyword("");
      setAppliedStatus("true");
      setPage(1);
    }
  }, [isOpen]);

  const params = useMemo(
    () => ({
      q: appliedKeyword || undefined,
      enabled:
        appliedStatus === "all"
          ? undefined
          : appliedStatus === "true"
          ? true
          : false,
      page,
      pageSize,
      sort: "name,asc",
    }),
    [appliedKeyword, appliedStatus, page, pageSize]
  );

  const { data, fetchStatus } = useCarModelSearch({
    params,
    enabled: isOpen,
    placeholderData: (prev) => prev,
  });

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const isFetching = fetchStatus === "fetching";

  const handleSearch = () => {
    setAppliedKeyword(keyword.trim());
    setAppliedStatus(status);
    setPage(1);
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("true");
    setAppliedKeyword("");
    setAppliedStatus("true");
    setPage(1);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer width="680px" onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>차량 모델 검색</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>검색 조건</SectionTitle>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <SearchBox
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={handleSearch}
              placeholder="모델명 검색"
              width="260px"
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              style={{ minWidth: 140 }}
            >
              <option value="true">활성 모델</option>
              <option value="false">비활성 모델</option>
              <option value="all">전체</option>
            </Select>
            <Button color="gray" onClick={handleReset}>
              초기화
            </Button>
          </div>
        </Section>

        <Section>
          <SectionTitle>검색 결과</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 80 }}>ID</Th>
                <Th>모델명</Th>
                <Th style={{ width: 120 }}>상태</Th>
                <Th style={{ width: 120 }}>선택</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <Td colSpan={4} style={{ textAlign: "center" }}>
                    {isFetching ? "불러오는 중..." : "검색 결과가 없습니다."}
                  </Td>
                </tr>
              ) : (
                rows.map((model) => (
                  <tr key={model.id}>
                    <Td>{model.id}</Td>
                    <Td style={{ textAlign: "left" }}>{model.name}</Td>
                    <Td>
                      {model.enabled ? "활성" : "중지"}
                    </Td>
                    <Td>
                      <Button
                        color="black"
                        size="sm"
                        onClick={() => {
                          onSelect(model);
                          onClose();
                        }}
                      >
                        선택
                      </Button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={Math.max(1, totalPages)}
            onChange={setPage}
            isBusy={isFetching}
            totalItems={total}
            pageSize={pageSize}
            showPageSize={false}
            align="center"
            dense
          />
        </Section>
      </ModalContainer>
    </Overlay>
  );
}
