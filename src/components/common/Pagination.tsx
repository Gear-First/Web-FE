import styled, { css } from "styled-components";
import { useMemo } from "react";

type BusyLike = boolean | "fetching" | "idle" | "paused";

type Props = {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
  arrowsOnly?: boolean;

  isBusy?: BusyLike;
  maxButtons?: number;

  totalItems?: number; // 총 건수 (있으면 범위 요약 표시)
  pageSize?: number; // 현재 페이지 크기
  pageSizeOptions?: number[]; // 페이지 크기 후보 (예: [10,20,50,100])
  onChangePageSize?: (size: number) => void;

  showSummary?: boolean; // 총건/범위 표시
  showPageSize?: boolean; // 페이지 크기 셀렉트 표시
  showJump?: boolean; // 페이지 숫자 직접 입력(빠른 이동)
  align?: "start" | "center" | "end"; // 배치 정렬
  dense?: boolean; // compact 모드
  sticky?: boolean; // 하단 고정 바
};

export default function Pagination({
  page,
  totalPages,
  onChange,
  isBusy = false,
  maxButtons = 5,

  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onChangePageSize,

  showSummary = true,
  showPageSize = true,
  align = "center",
  dense = false,
  sticky = false,
  arrowsOnly = false,
}: Props) {
  const busy = isBusy === true || isBusy === "fetching";
  const clamp = (n: number) => Math.min(totalPages, Math.max(1, n));
  const half = Math.floor((maxButtons ?? 7) / 2);

  const { start, end, pages } = useMemo(() => {
    if (totalPages <= 0) return { start: 1, end: 1, pages: [1] };
    let s = Math.max(1, page - half);
    let e = s + (maxButtons ?? 7) - 1;
    if (e > totalPages) {
      e = totalPages;
      s = Math.max(1, e - (maxButtons ?? 7) + 1);
    }
    const arr = Array.from({ length: e - s + 1 }, (_, i) => s + i);
    return { start: s, end: e, pages: arr };
  }, [page, totalPages, half, maxButtons]);

  const goto = (n: number) => !busy && onChange(clamp(n));

  // 요약(범위) 계산
  const { from, to } = useMemo(() => {
    if (!totalItems || !pageSize) return { from: undefined, to: undefined };
    const f = (page - 1) * pageSize + 1;
    const t = Math.min(page * pageSize, totalItems);
    return { from: f, to: t };
  }, [page, pageSize, totalItems]);

  if (totalPages <= 1) {
    // 총건수나 페이지 크기 선택은 보여주고 싶다면 이 아래 return을 지우고 Wrap는 유지 가능
    // return null;
  }

  return (
    <Bar
      $align={align}
      $dense={dense}
      $sticky={sticky}
      role="navigation"
      aria-label="페이지네이션"
    >
      <Left></Left>
      {/* 가운데: 컨트롤 */}
      <Center>
        <IconButton
          aria-label="처음 페이지"
          onClick={() => goto(1)}
          disabled={page === 1 || busy}
        >
          «
        </IconButton>
        <IconButton
          aria-label="이전 페이지"
          onClick={() => goto(page - 1)}
          disabled={page === 1 || busy}
        >
          ‹
        </IconButton>
        {!arrowsOnly && (
          <>
            {start > 1 && (
              <>
                <PageButton onClick={() => goto(1)} disabled={busy}>
                  1
                </PageButton>
                {start > 2 && <Ellipsis aria-hidden>…</Ellipsis>}
              </>
            )}

            {pages.map((p) => (
              <PageButton
                key={p}
                $active={p === page}
                aria-current={p === page ? "page" : undefined}
                onClick={() => goto(p)}
                disabled={busy || p === page}
                title={`${p} 페이지`}
              >
                {p}
              </PageButton>
            ))}

            {end < totalPages && (
              <>
                {end < totalPages - 1 && <Ellipsis aria-hidden>…</Ellipsis>}
                <PageButton onClick={() => goto(totalPages)} disabled={busy}>
                  {totalPages}
                </PageButton>
              </>
            )}
          </>
        )}

        <IconButton
          aria-label="다음 페이지"
          onClick={() => goto(page + 1)}
          disabled={page === totalPages || busy}
        >
          ›
        </IconButton>
        <IconButton
          aria-label="마지막 페이지"
          onClick={() => goto(totalPages)}
          disabled={page === totalPages || busy}
        >
          »
        </IconButton>

        {/* Busy 표시 (간단 스피너) */}
        <Busy $show={busy} aria-hidden={!busy} />
      </Center>

      {/* 왼쪽: 요약/페이지 크기 */}
      <Right>
        {showSummary && totalItems !== undefined && pageSize !== undefined && (
          <Summary aria-live="polite">
            {from !== undefined && to !== undefined
              ? `${from.toLocaleString()}–${to.toLocaleString()} / ${totalItems.toLocaleString()}`
              : `${totalItems.toLocaleString()} items`}
          </Summary>
        )}

        {showPageSize && onChangePageSize && (
          <SizeWrap>
            <label htmlFor="page-size" style={{ display: "none" }}>
              페이지 크기
            </label>
            <SizeSelect
              id="page-size"
              value={pageSize}
              onChange={(e) => onChangePageSize(Number(e.target.value))}
              disabled={busy}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}/페이지
                </option>
              ))}
            </SizeSelect>
          </SizeWrap>
        )}
      </Right>
    </Bar>
  );
}

/* ===================== styles ===================== */

const Bar = styled.div<{
  $align: "start" | "center" | "end";
  $dense: boolean;
  $sticky: boolean;
}>`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  margin: 16px 0 4px;
  ${({ $align }) =>
    $align === "start"
      ? css`
          justify-items: start;
        `
      : $align === "end"
      ? css`
          justify-items: end;
        `
      : css`
          justify-items: center;
        `}

  ${({ $dense }) =>
    $dense &&
    css`
      margin: 8px 0 0;
      gap: 6px;
    `}

  ${({ $sticky }) =>
    $sticky &&
    css`
      position: sticky;
      bottom: 0;
      background: #fff;
      padding: 8px 12px;
      border-top: 1px solid #e5e7eb;
      z-index: 5;
    `}

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
    }
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
`;
const Center = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-self: center;
  position: relative;
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
`;

const Summary = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const SizeWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;
const SizeSelect = styled.select`
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 0 10px;
  font-size: 13px;
  color: #111827;

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
`;

const BaseBtn = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  font: inherit;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: all 140ms ease;
  user-select: none;
  border-radius: 999px;
`;

const PageButton = styled(BaseBtn)<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? "#111827" : "#E5E7EB")};
  background: ${({ $active }) => ($active ? "#111827" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#111827")};
  box-shadow: ${({ $active }) =>
    $active
      ? "0 6px 16px rgba(17, 24, 39, .18)"
      : "0 2px 8px rgba(17, 24, 39, .06)"};

  &:hover {
    border-color: #111827;
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
  }
  &:disabled {
    opacity: ${({ $active }) => ($active ? 1 : 0.5)};
    cursor: default;
    transform: none;
    box-shadow: ${({ $active }) =>
      $active
        ? "0 6px 16px rgba(17, 24, 39, .18)"
        : "0 2px 8px rgba(17, 24, 39, .06)"};
  }
  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
`;

const IconButton = styled(BaseBtn)`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  color: #374151;
  background: #ffffff;

  &:hover {
    border-color: #111827;
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
`;

const Ellipsis = styled.span`
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 4px;
  color: #9ca3af;
`;

const Busy = styled.div<{ $show: boolean }>`
  position: absolute;
  right: -28px;
  width: 16px;
  height: 16px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 140ms ease;
  &:before {
    content: "";
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #d1d5db;
    border-top-color: #4f46e5;
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
