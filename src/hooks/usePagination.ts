import { useCallback, useState } from "react";

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const onChangePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const onChangePageSize = useCallback((next: number) => {
    setPageSize(next);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    onChangePage,
    onChangePageSize,
    resetPage,
  };
}
