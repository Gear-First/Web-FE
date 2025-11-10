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
import type { MaterialRecord } from "../../items/materials/MaterialTypes";
import { useMaterialSearch } from "../../items/materials/hooks/useMaterialSearch";
import SearchBox from "../../components/common/SearchBox";
import { useDebouncedValue } from "./useDebouncedValue";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (material: MaterialRecord) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 5;

const MaterialSearchModal = ({
  isOpen,
  onClose,
  onSelect,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) => {
  const [keyword, setKeyword] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [params, setParams] = useState({
    keyword: undefined as string | undefined,
    page: 1,
    pageSize,
  });
  const debouncedKeyword = useDebouncedValue(keyword, 400);

  useEffect(() => {
    if (isOpen) {
      setHasSearched(true);
      setParams({ keyword: undefined, page: 1, pageSize });
    } else {
      setKeyword("");
      setHasSearched(false);
    }
  }, [isOpen, pageSize]);

  const { data, isFetching, error } = useMaterialSearch({
    params,
    enabled: isOpen && hasSearched,
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleSelect = (row: MaterialRecord) => {
    onSelect(row);
  };

  const onSearch = () => {
    const trimmed = keyword.trim();
    setParams((prev) => ({
      ...prev,
      keyword: trimmed ? trimmed : undefined,
      page: 1,
    }));
    setHasSearched(true);
  };

  useEffect(() => {
    if (!isOpen || !hasSearched) return;
    const trimmed = debouncedKeyword.trim();
    setParams((prev) => ({
      ...prev,
      keyword: trimmed ? trimmed : undefined,
      page: 1,
    }));
  }, [debouncedKeyword, hasSearched, isOpen]);

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
            <Title>자재 검색</Title>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="닫기">
            &times;
          </CloseButton>
        </Header>

        <Section>
          <SectionTitle>검색 조건</SectionTitle>
          <SearchBox
            placeholder="자재 코드 / 자재명"
            keyword={keyword}
            onSearch={onSearch}
            onKeywordChange={setKeyword}
            onReset={() => {
              setKeyword("");
              setParams({ keyword: undefined, page: 1, pageSize });
              setHasSearched(false);
            }}
            width="100%"
          />

          <HelperText>
            입력 시 자동으로 검색합니다. (현재 페이지 {params.page}/{" "}
            {Math.max(1, totalPages)})
          </HelperText>
          {error && <ErrorText>{error.message}</ErrorText>}
        </Section>

        <Section>
          <SectionTitle>검색 결과</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 120 }}>자재 코드</Th>
                <Th>자재명</Th>
                <Th style={{ width: 140 }}>등록일</Th>
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
                  <tr key={row.id}>
                    <Td>{row.materialCode}</Td>
                    <Td>{row.materialName}</Td>
                    <Td>{row.createdDate ?? "-"}</Td>
                    <Td>
                      <Button
                        color="black"
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

export default MaterialSearchModal;

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
