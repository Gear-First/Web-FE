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
import { Table, Th, Td } from "../../components/common/PageLayout";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import styled from "styled-components";
import type { PartRecord } from "../../items/parts/PartTypes";
import { usePartSearch } from "../../items/parts/hooks/usePartSearch";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (part: PartRecord) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 5;

const PartSearchModal = ({
  isOpen,
  onClose,
  onSelect,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) => {
  const [keyword, setKeyword] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [params, setParams] = useState({
    q: undefined as string | undefined,
    page: 1,
    pageSize,
  });

  useEffect(() => {
    if (isOpen) {
      setHasSearched(true);
      setParams({ q: undefined, page: 1, pageSize });
    } else {
      setKeyword("");
      setHasSearched(false);
    }
  }, [isOpen, pageSize]);

  const { data, isFetching, error } = usePartSearch({
    params,
    enabled: isOpen && hasSearched,
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleSelect = (row: PartRecord) => {
    onSelect(row);
  };

  const onSearch = () => {
    const trimmed = keyword.trim();
    setParams((prev) => ({
      ...prev,
      q: trimmed ? trimmed : undefined,
      page: 1,
    }));
    setHasSearched(true);
  };

  const onReset = () => {
    setKeyword("");
    setParams({ q: undefined, page: 1, pageSize });
    setHasSearched(false);
  };

  const onChangePage = (next: number) => {
    setParams((prev) => ({
      ...prev,
      page: next,
    }));
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>부품 검색</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>검색 조건</SectionTitle>
          <SearchRow>
            <SearchInput
              placeholder="부품 코드 / 부품명"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button size="sm" onClick={onSearch}>
              검색
            </Button>
            <Button color="gray" size="sm" onClick={onReset}>
              초기화
            </Button>
          </SearchRow>
          <HelperText>
            검색 버튼을 눌러 목록을 불러옵니다. (현재 페이지 {params.page}/
            {Math.max(1, totalPages)})
          </HelperText>
          {error && <ErrorText>{error.message}</ErrorText>}
        </Section>

        <Section>
          <SectionTitle>검색 결과</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 140 }}>부품 코드</Th>
                <Th>부품명</Th>
                <Th style={{ width: 140 }}>카테고리</Th>
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
                rows.map((row) => (
                  <tr key={row.partId}>
                    <Td>{row.partCode}</Td>
                    <Td>{row.partName}</Td>
                    <Td>{row.category?.name ?? "-"}</Td>
                    <Td>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSelect(row);
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
            page={params.page}
            totalPages={Math.max(1, totalPages)}
            onChange={onChangePage}
            isBusy={isFetching}
            maxButtons={5}
            totalItems={total}
            pageSize={pageSize}
            showSummary
            showPageSize={false}
            align="center"
            dense
          />
        </Section>
      </ModalContainer>
    </Overlay>
  );
};

export default PartSearchModal;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
`;

const HelperText = styled.p`
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: #6b7280;
`;

const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: #ef4444;
`;
